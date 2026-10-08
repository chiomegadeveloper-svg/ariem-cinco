const MAX_BYTES=2*1024*1024;
export type CropSettings={zoom:number;x:number;y:number};

export function normalizeCrop(crop:CropSettings):CropSettings{
  return{
    zoom:Math.max(1,Math.min(2.5,Number(crop.zoom)||1)),
    x:Math.max(-100,Math.min(100,Number(crop.x)||0)),
    y:Math.max(-100,Math.min(100,Number(crop.y)||0))
  };
}

export function cropFromImageUrl(url:string|null|undefined):CropSettings{
  const fallback:CropSettings={zoom:1,x:0,y:0};
  if(!url)return fallback;
  const match=url.match(/#crop=([^#]+)/);
  if(!match)return fallback;
  const parts=match[1].split(",").map(Number);
  if(parts.length!==3||parts.some(value=>!Number.isFinite(value)))return fallback;
  return normalizeCrop({zoom:parts[0],x:parts[1],y:parts[2]});
}

export function imageUrlWithoutCrop(url:string|null|undefined):string|null{
  if(!url)return null;
  return url.split("#",1)[0];
}

export function imageUrlWithCrop(url:string,crop:CropSettings):string{
  const normalized=normalizeCrop(crop);
  const base=imageUrlWithoutCrop(url)||url;
  return `${base}#crop=${normalized.zoom.toFixed(2)},${Math.round(normalized.x)},${Math.round(normalized.y)}`;
}

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
    let outputWidth=Math.min(2400,image.naturalWidth);
    let outputHeight=Math.max(1,Math.round(outputWidth*image.naturalHeight/image.naturalWidth));
    for(let resize=0;resize<8;resize++){
      const canvas=document.createElement("canvas");
      canvas.width=outputWidth;
      canvas.height=outputHeight;
      const context=canvas.getContext("2d")!;
      context.drawImage(image,0,0,outputWidth,outputHeight);
      for(const quality of [.9,.84,.78,.7,.62,.54,.46]){
        const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/webp",quality));
        if(blob&&blob.size<=MAX_BYTES)return blob;
      }
      outputWidth=Math.round(outputWidth*.82);
      outputHeight=Math.round(outputHeight*.82);
    }
    throw new Error("The image cannot be reduced below 2 MB. Please choose another image.");
  }finally{URL.revokeObjectURL(objectUrl)}
}
