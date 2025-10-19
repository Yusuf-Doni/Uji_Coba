const downloadHandlerBlobFile = (blobFile, fileName) => {
    const downloadUrl = URL.createObjectURL(blobFile);
    const linkElement = document.createElement('a');
    linkElement.href = downloadUrl;
    linkElement.download = fileName;

    document.body.appendChild(linkElement);
    linkElement.click();

    document.body.removeChild(linkElement);
    URL.revokeObjectURL(downloadUrl);
};

export default downloadHandlerBlobFile;
