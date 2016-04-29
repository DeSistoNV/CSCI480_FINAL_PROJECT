function make_mesh(nii_file)
  cd 'matlab/MRIcroS/';
  [pathstr,name,ext] = fileparts(nii_file);
  MRIcroS('addLayer',nii_file);
  MRIcroS('saveMesh',fullfile(pathstr,'mesh.ply')); %export mesh to PLY format
end
