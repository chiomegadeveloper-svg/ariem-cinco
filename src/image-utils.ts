const MAX_BYTES=2*1024*1024;

export async function toWebpUnder2Mb(file:File):Promise<Blob>{
  if(!file.type.startsWith("image/"))throw new Error("Please choose an image file.");
  const objectUrl=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error("The image could not be read."));
      img.src=objectUrl;
    });
    let scale=Math.min(1,1920/Math.max(image.naturalWidth,image.naturalHeight));
    for(let resize=0;resize<7;resize++){
      const canvas=document.createElement("canvas");
      canvas.width=Math.max(1,Math.round(image.naturalWidth*scale));
      canvas.height=Math.max(1,Math.round(image.naturalHeight*scale));
      canvas.getContext("2d")!.drawImage(image,0,0,canvas.width,canvas.height);
      for(const quality of [.86,.78,.7,.62,.54,.46]){
        const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
        if(blob&&blob.size<=MAX_BYTES)return blob;
      }
      scale*=.78;
    }
    throw new Error("The image cannot be reduced below 2 MB. Please choose another image.");
  }finally{URL.revokeObjectURL(objectUrl)}
}
