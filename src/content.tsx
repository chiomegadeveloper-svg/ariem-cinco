import React,{useEffect,useState}from"react";
import{ChevronLeft,ChevronRight,Image as ImageIcon,X}from"lucide-react";
import{defaultSettings,Entry,getEntries,getSettings,Section,Settings}from"./data";

export function useSiteSettings(){
  const[settings,setSettings]=useState<Settings>(defaultSettings);
  useEffect(()=>{getSettings().then(setSettings)},[]);
  return settings;
}

export function useSectionEntries(section:Section){
  const[entries,setEntries]=useState<Entry[]>([]);
  const[loading,setLoading]=useState(true);
  useEffect(()=>{setLoading(true);getEntries(section).then(setEntries).finally(()=>setLoading(false))},[section]);
  return{entries,loading};
}

export function EntryGrid({section,variant="dark"}:{section:Section;variant?:"dark"|"light"}){
  const{entries,loading}=useSectionEntries(section);
  const[selected,setSelected]=useState<Entry|null>(null);
  if(loading)return <div className="entry-grid"><div className="entry-skeleton"/><div className="entry-skeleton"/><div className="entry-skeleton"/></div>;
  if(!entries.length)return <div className={`content-empty ${variant}`}><ImageIcon/><h3>No published entries yet</h3><p>New articles will appear here after the owner publishes them.</p></div>;
  return <>
    <div className={`entry-grid ${variant}`}>{entries.map(entry=><button className="entry-card" key={entry.id} onClick={()=>setSelected(entry)}>
      <span className="entry-image">{entry.image_url?<img src={entry.image_url} alt=""/>:<ImageIcon/>}</span>
      <span className="entry-copy"><small>{entry.section}</small><strong>{entry.title}</strong><p>{entry.excerpt}</p><b>Read article</b></span>
    </button>)}</div>
    {selected&&<ArticleModal entry={selected} close={()=>setSelected(null)}/>} 
  </>;
}

function ArticleModal({entry,close}:{entry:Entry;close:()=>void}){
  useEffect(()=>{const key=(e:KeyboardEvent)=>e.key==="Escape"&&close();document.body.classList.add("modal-open");window.addEventListener("keydown",key);return()=>{document.body.classList.remove("modal-open");window.removeEventListener("keydown",key)}},[close]);
  return <div className="article-backdrop" onMouseDown={e=>e.target===e.currentTarget&&close()} role="presentation"><article className="article-modal" role="dialog" aria-modal="true" aria-labelledby="article-title">
    <button className="article-close" onClick={close} aria-label="Close article"><X/></button>
    {entry.image_url&&<img className="article-cover" src={entry.image_url} alt=""/>}
    <div className="article-body"><p className="kicker">{entry.section}</p><h2 id="article-title">{entry.title}</h2><p className="article-lead">{entry.excerpt}</p><div className="article-text">{entry.body.split("\n").map((line,index)=>line?<p key={index}>{line}</p>:<br key={index}/>)}</div></div>
  </article></div>;
}

export function PortfolioCarousel(){
  const{entries}=useSectionEntries("portfolio");
  const[active,setActive]=useState(0);
  useEffect(()=>{if(entries.length<2)return;const timer=window.setInterval(()=>setActive(v=>(v+1)%entries.length),4500);return()=>window.clearInterval(timer)},[entries.length]);
  if(!entries.length)return <div className="portfolio-carousel carousel-empty"><p>Featured portfolio entries will appear here.</p></div>;
  return <div className="portfolio-carousel" aria-label="Featured portfolio"><div className="carousel-track" style={{transform:`translateX(-${active*100}%)`}}>{entries.map((entry,index)=><article className="carousel-slide" key={entry.id} aria-hidden={active!==index}><div><span>Portfolio</span><h3>{entry.title}</h3><p>{entry.excerpt}</p></div><strong>{String(index+1).padStart(2,"0")}</strong></article>)}</div><div className="carousel-controls">{entries.map((entry,index)=><button key={entry.id} className={active===index?"active":""} onClick={()=>setActive(index)} aria-label={`Show ${entry.title}`}/>)}</div></div>;
}

export function EntryCarousel({section}:{section:Section}){
  const{entries,loading}=useSectionEntries(section);
  const[active,setActive]=useState(0);
  const[selected,setSelected]=useState<Entry|null>(null);
  useEffect(()=>{setActive(0)},[section,entries.length]);
  useEffect(()=>{if(entries.length<2)return;const timer=window.setInterval(()=>setActive(value=>(value+1)%entries.length),5500);return()=>window.clearInterval(timer)},[entries.length]);
  if(loading)return <div className="content-carousel entry-skeleton"/>;
  if(!entries.length)return <div className="content-empty"><ImageIcon/><h3>No published entries yet</h3><p>Foundation articles will appear here after the owner publishes them.</p></div>;
  const current=entries[active];
  return <>
    <section className="content-carousel" aria-label={`${section} articles`}>
      <button className="carousel-feature" onClick={()=>setSelected(current)}>
        <span className="carousel-feature-image">{current.image_url?<img src={current.image_url} alt=""/>:<ImageIcon/>}</span>
        <span className="carousel-feature-copy"><small>{section} · {String(active+1).padStart(2,"0")}</small><strong>{current.title}</strong><p>{current.excerpt}</p><b>Read full article</b></span>
      </button>
      {entries.length>1&&<div className="content-carousel-nav"><button onClick={()=>setActive(value=>(value-1+entries.length)%entries.length)} aria-label="Previous article"><ChevronLeft/></button><div>{entries.map((entry,index)=><button key={entry.id} className={active===index?"active":""} onClick={()=>setActive(index)} aria-label={`Show ${entry.title}`}/>)}</div><button onClick={()=>setActive(value=>(value+1)%entries.length)} aria-label="Next article"><ChevronRight/></button></div>}
    </section>
    {selected&&<ArticleModal entry={selected} close={()=>setSelected(null)}/>} 
  </>;
}
