function createRequestEvidenceFolder(requestId) {
  if (!requestId || typeof requestId !== 'string') {
    throw new Error('Valid requestId is required to provision an evidence folder.');
  }

  const rootFolderId = ensureEvidenceRootFolder();
  const rootFolder = DriveApp.getFolderById(rootFolderId);
  const existingSubfolders = rootFolder.getFoldersByName(requestId);

  if (existingSubfolders.hasNext()) {
    const existingFolder = existingSubfolders.next();
    return {
      folderId: existingFolder.getId(),
      folderUrl: existingFolder.getUrl()
    };
  }

  const createdFolder = rootFolder.createFolder(requestId);
  return {
    folderId: createdFolder.getId(),
    folderUrl: createdFolder.getUrl()
  };
}

function saveBase64EvidenceImage(folderId, fileLabel, base64Content, mimeType) {
  if (!base64Content) {
    return '';
  }

  const targetFolder = DriveApp.getFolderById(folderId);
  const strippedBase64 = base64Content.replace(/^data:image\/\w+;base64,/, '');
  const decodedBytes = Utilities.base64Decode(strippedBase64);
  const safeMimeType = mimeType || 'image/jpeg';
  const fileExtension = safeMimeType.split('/')[1] || 'jpg';
  const fileName = fileLabel + '_' + new Date().getTime() + '.' + fileExtension;

  const imageBlob = Utilities.newBlob(decodedBytes, safeMimeType, fileName);
  const uploadedFile = targetFolder.createFile(imageBlob);
  uploadedFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return uploadedFile.getUrl();
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    createRequestEvidenceFolder,
    saveBase64EvidenceImage
  };
}
