export const setupWebcam = async (video) => {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          video.srcObject = stream;
          video.onloadedmetadata = () => resolve();
        })
        .catch(reject);
    });
  };
  