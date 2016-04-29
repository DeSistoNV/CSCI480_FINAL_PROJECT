#! /usr/bin/env python


''' ply -> obj -> js lists


$ cd /home/nick/github/CSCI480/p4/script_setup
$ ipython run.py white.nii white

USAGE:
    ./run.py [nifti file] [output name]

ipython run.py

'''

CLEANUP = False # delete intermediate files?
DEC = True # apply edge decimation?


import sys
from time import time
from subprocess import call
from os import remove
from os.path import isfile,abspath

start = time()

def which(program):
    import os
    def is_exe(fpath):
        return os.path.isfile(fpath) and os.access(fpath, os.X_OK)

    fpath, fname = os.path.split(program)
    if fpath:
        if is_exe(program):
            return program
    else:
        for path in os.environ["PATH"].split(os.pathsep):
            path = path.strip('"')
            exe_file = os.path.join(path, program)
            if is_exe(exe_file):
                return exe_file

    return None

def parse_lines(llist):
    ''' parse vertices and stuf '''
    llist = [x[2:].strip().split(" ") for x in llist]
    return map(lambda x: map(float,x), llist)

def parse_faces(flist):
    ''' parse faces '''
    flist = map(lambda x: x[2:].strip().split(" "), flist)
    for i in xrange(len(flist)):
        flist[i] = [x.replace('End','').split('//')  for x in flist[i]]
    return flist





if len(sys.argv) < 3:
    print 'You did not include the required arguements.\n\n'
    print 'USAGE: \n\t ipython run.py [nifti file] [output name]'
    sys.exit()

# sys args
nii_file = sys.argv[1]
mesh_name = sys.argv[2]

if not isfile(nii_file):
    print 'could not find {}. exiting.'.format(nii_file)
    sys.exit()
if not nii_file.endswith('.nii'):
    print '{} is not a nifti file. exiting.'.format(nii_file)
    sys.exit()

nii_file = abspath(nii_file)

if not which('matlab'):
    print 'missing dependency MATLAB. exiting.'
    sys.exit()


matlab_cmd = "matlab -nodesktop -nosplash -nodisplay -r "
matlab_cmd += "\"cd 'src'; make_mesh('{}');quit();\""
matlab_cmd = matlab_cmd.format(nii_file)
print 'running: \n %s' % matlab_cmd
call(matlab_cmd,shell=True)

dec_script = './src/edge_dec.mlx'

dec_flag = '-s {}'.format(dec_script)

if not which('meshlabserver'):
    print 'missing dependency Meshlab. exiting.'
    sys.exit()



meshlab_cmd = 'meshlabserver -i ./mesh.ply -o ./mesh.obj {}'
if DEC:
    if isfile(dec_script):
        meshlab_cmd = meshlab_cmd.format(dec_flag)
    else:
        print 'couldnt find edge decimation file. running without.'
        meshlab_cmd = meshlab_cmd.format('')

else:
    meshlab_cmd = meshlab_cmd.format('')


if not isfile('./mesh.ply'):
    print 'mesh.ply not found. is matlab installed? exiting.'
    sys.exit(1)

print 'running {}\n...'.format(meshlab_cmd)
call(meshlab_cmd,shell=True)


if CLEANUP:
    remove('./mesh.ply')

vertices = []
normals = []
parameters = []
textures = []
faces = []

if not isfile('./mesh.obj'):
    print 'mesh.obj not found. is meshlab installed? exiting.'
    sys.exit(1)


with open('./mesh.obj', 'r') as f:
    lines = f.readlines()[1:]

if CLEANUP:
    remove('./mesh.obj')
for line in lines: #lines[:8182]:
    if 'v ' in line:
        vertices.append(line)
    elif 'vn ' in line:
        normals.append(line)
    elif 'vt ' in line:
        textures.append(line)
    elif 'f ' in line:
        faces.append(line)
    elif 'vp ' in line:
        parameters.append(line)
    else:
        print line
print 'len(vertices) : {}'.format(len(vertices))
print 'len(faces) : {}'.format(len(faces))
print 'len(textures) : {}'.format(len(textures))
print 'len(parameters) : {}'.format(len(parameters))
print 'len(normals) : {}'.format(len(normals))




try:
    parsed_v = parse_lines(vertices)
    parsed_t = parse_lines(textures)
    parsed_n= parse_lines(normals)
    parsed_f = parse_faces(faces[:-1])
except:
    sys.stderr.write('unknown error while parsing mesh.obj . exiting.\n')
    sys.exit()

js_vertices = "V = ["
for v in parsed_v:
    js_vertices += str(v) + ',\n'

js_vertices = js_vertices[:-2] + "];"

with open("{}_vtx.js".format(mesh_name), "w") as f:
    f.write(js_vertices)

js_faces = "F = ["
for f in parsed_f:
    js_faces += str([f[0] for f in f]) + ',\n'
js_faces = js_faces[:-2] + "];"

with open("{}_fce.js".format(mesh_name), "w") as f:
    f.write(js_faces)


print '\n execution finished in {} seconds'.format(time() - start)
