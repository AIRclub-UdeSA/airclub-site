// Sube un archivo directo a Supabase Storage con la URL firmada de signUpload (ver storage.ts).
// XMLHttpRequest y no fetch: fetch no informa el progreso de subida, y con videos de decenas de MB
// hace falta la barra para que nadie cierre la pestaña creyendo que se colgó.
export function uploadToSignedUrl(signedUrl: string, file: File, onProgress: (fraction: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    body.append("cacheControl", "3600");
    body.append("", file);

    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => (xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`Storage respondió ${xhr.status}: ${xhr.responseText}`)));
    xhr.onerror = () => reject(new Error("Se cortó la conexión mientras se subía el archivo."));
    xhr.send(body);
  });
}
