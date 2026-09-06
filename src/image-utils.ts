const MAX_BYTES=2*1024*1024;
export type CropSettings={zoom:number;x:number;y:number};

export async function toWebpUnder2Mb(file:File,crop:CropSettings={zoom:1,x:0,y:0}):Promise<Blob>{
  if(!file.type.startsWith("image/"))throw new Error("Please choose an image file.");
  const objectUrl=URL.createObjectURL(file);
  try{
    const image=await new Promise<HTMLImageElement>((resolve,reject)=>{
      const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error("The image could not be read."));img.src=objectUrl;
    });
    let outputWidth=1600,outputHeight=1000;
    for(let resize=0;resize<7;resize++){
      const canvas=document.createElement("canvas");canvas.width=outputWidth;canvas.height=outputHeight;
      const context=canvas.getContext("2d")!;
      const coverScale=Math.max(outputWidth/image.naturalWidth,outputHeight/image.naturalHeight)*crop.zoom;
      const drawWidth=image.naturalWidth*coverScale,drawHeight=image.naturalHeight*coverScale;
      const overflowX=Math.max(0,(drawWidth-outputWidth)/2),overflowY=Math.max(0,(drawHeight-outputHeight)/2);
      const drawX=(outputWidth-drawWidth)/2+(crop.x/100)*overflowX;
      const drawY=(outputHeight-drawHeight)/2+(crop.y/100)*overflowY;
      context.drawImage(image,drawX,drawY,drawWidth,drawHeight);
      for(const quality of [.88,.8,.72,.64,.56,.48]){
        const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
        if(blob&&blob.size<=MAX_BYTES)return blob;
      }
      outputWidth=Math.round(outputWidth*.82);outputHeight=Math.round(outputHeight*.82);
    }
    throw new Error("The image cannot be reduced below 2 MB. Please choose another image.");
  }finally{URL.revokeObjectURL(objectUrl)}
}
