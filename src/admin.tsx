import React,{useEffect,useState}from"react";
import{FileText,Inbox,LogOut,Pencil,RotateCcw,Save,Settings2,Trash2,Upload}from"lucide-react";
import{defaultSettings,Entry,getEntries,getSettings,Inquiry,OWNER_EMAIL,Section,Settings,supabase}from"./data";
import{CropSettings,toWebpUnder2Mb}from"./image-utils";

const sections:Section[]=["portfolio","foundation","topics","highlights","projects"];
const emptyEntry={section:"portfolio" as Section,title:"",excerpt:"",body:"",sort_order:0,published:true};

export function Admin(){
  const[user,setUser]=useState<string|null>(null);
  const[password,setPassword]=useState("");
  const[note,setNote]=useState("");
  const[tab,setTab]=useState<"settings"|"entries"|"inquiries">("entries");
  const[settings,setSettings]=useState<Settings>(defaultSettings);
  const[entries,setEntries]=useState<Entry[]>([]);
  const[inquiries,setInquiries]=useState<Inquiry[]>([]);
  const[entry,setEntry]=useState(emptyEntry);
  const[image,setImage]=useState<File|null>(null);
  const[imagePreview,setImagePreview]=useState("");
  const[crop,setCrop]=useState<CropSettings>({zoom:1,x:0,y:0});
  const[editing,setEditing]=useState<Entry|null>(null);
  const[saving,setSaving]=useState(false);

  useEffect(()=>{
    supabase?.auth.getUser().then(({data})=>acceptUser(data.user?.email||null));
    const listener=supabase?.auth.onAuthStateChange((_event,session)=>acceptUser(session?.user.email||null));
    return()=>listener?.data.subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(user){loadEntries();loadInquiries();getSettings().then(setSettings)}},[user]);
  useEffect(()=>{if(!image){setImagePreview("");return}const url=URL.createObjectURL(image);setImagePreview(url);return()=>URL.revokeObjectURL(url)},[image]);

  function acceptUser(email:string|null){
    if(email&&email.toLowerCase()!==OWNER_EMAIL){supabase?.auth.signOut();setNote("This account is not authorized as the website owner.");setUser(null);return}
    setUser(email);
  }
  async function login(e:React.FormEvent){
    e.preventDefault();setNote("Signing in…");
    if(!supabase)return setNote("Connect Supabase first.");
    const{error}=await supabase.auth.signInWithPassword({email:OWNER_EMAIL,password});
    setNote(error?error.message:"");
  }
  async function loadEntries(){
    const results=await Promise.all(sections.map(section=>getEntries(section,true)));
    setEntries(results.flat().sort((a,b)=>a.section.localeCompare(b.section)||a.sort_order-b.sort_order));
  }
  async function loadInquiries(){
    if(!supabase)return;
    const{data}=await supabase.from("inquiries").select("*").order("created_at",{ascending:false});
    setInquiries((data||[]) as Inquiry[]);
  }
  async function saveSettings(){
    if(!supabase)return;
    setSaving(true);setNote("Saving…");
    const{error}=await supabase.from("site_settings").upsert(Object.entries(settings).map(([key,value])=>({key,value,updated_at:new Date().toISOString()})));
    setNote(error?error.message:"Website settings saved.");setSaving(false);
  }
  async function saveEntry(e:React.FormEvent){
    e.preventDefault();if(!supabase)return;
    setSaving(true);setNote("Publishing entry…");
    try{
      let image_url=editing?.image_url||null,image_path=editing?.image_path||null;
      if(image){
        const webp=await toWebpUnder2Mb(image,crop);
        const{data:{user:authUser}}=await supabase.auth.getUser();
        if(!authUser)throw new Error("Please sign in again.");
        const newImagePath=`${authUser.id}/${crypto.randomUUID()}.webp`;
        const{error:uploadError}=await supabase.storage.from("article-images").upload(newImagePath,webp,{contentType:"image/webp"});
        if(uploadError)throw uploadError;
        image_path=newImagePath;
        image_url=supabase.storage.from("article-images").getPublicUrl(newImagePath).data.publicUrl;
      }
      const payload={...entry,image_url,image_path,updated_at:new Date().toISOString()};
      const{error}=editing?await supabase.from("content_entries").update(payload).eq("id",editing.id):await supabase.from("content_entries").insert(payload);
      if(error)throw error;
      if(image&&editing?.image_path&&editing.image_path!==image_path)await supabase.storage.from("article-images").remove([editing.image_path]);
      resetEditor();setNote(editing?"Entry updated successfully.":"Entry published successfully.");await loadEntries();
    }catch(error){setNote(error instanceof Error?error.message:"The entry could not be saved.")}finally{setSaving(false)}
  }
  async function deleteEntry(item:Entry){
    if(!supabase||!confirm(`Delete “${item.title}”? This cannot be undone.`))return;
    setNote("Deleting entry…");
    const{error}=await supabase.from("content_entries").delete().eq("id",item.id);
    if(!error&&item.image_path)await supabase.storage.from("article-images").remove([item.image_path]);
    setNote(error?error.message:"Entry deleted.");await loadEntries();
  }
  function startEdit(item:Entry){
    setEditing(item);setEntry({section:item.section,title:item.title,excerpt:item.excerpt,body:item.body,sort_order:item.sort_order,published:item.published});setImage(null);setCrop({zoom:1,x:0,y:0});setNote(`Editing “${item.title}”`);window.scrollTo({top:0,behavior:"smooth"});
  }
  function resetEditor(){setEditing(null);setEntry(emptyEntry);setImage(null);setCrop({zoom:1,x:0,y:0})}
  async function updateStatus(item:Inquiry,status:Inquiry["status"]){
    if(!supabase)return;
    const{error}=await supabase.from("inquiries").update({status}).eq("id",item.id);
    setNote(error?error.message:"RFQ status updated.");await loadInquiries();
  }
  async function deleteInquiry(item:Inquiry){
    if(!supabase||!confirm(`Delete the RFQ from ${item.name}?`))return;
    const{error}=await supabase.from("inquiries").delete().eq("id",item.id);
    setNote(error?error.message:"RFQ deleted.");await loadInquiries();
  }

  if(!user)return <main className="admin-login"><a href="/">← Back to website</a><form onSubmit={login}><img src="/brand/ariem-logo.png" alt="Ariem Cinco"/><p className="kicker">Owner access</p><h1>Control center</h1><label>Official owner email<input type="email" value={OWNER_EMAIL} readOnly/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label><button className="btn btn-primary">Sign in</button>{note&&<p className="admin-note">{note}</p>}</form></main>;

  return <main className="admin-shell"><aside><a className="admin-brand" href="/">AC <span>Ariem Cinco</span></a><button className={tab==="entries"?"active":""} onClick={()=>setTab("entries")}><FileText/>Articles</button><button className={tab==="settings"?"active":""} onClick={()=>setTab("settings")}><Settings2/>Page content</button><button className={tab==="inquiries"?"active":""} onClick={()=>setTab("inquiries")}><Inbox/>RFQ inbox <b>{inquiries.filter(x=>x.status==="new").length}</b></button><button className="signout" onClick={()=>supabase?.auth.signOut()}><LogOut/>Sign out</button></aside><section className="admin-main"><header><div><p className="kicker">Owner control center</p><h2>{tab==="entries"?"Publish articles":tab==="settings"?"Page content":"RFQ receiver"}</h2></div><a href="/">View website</a></header>
    {tab==="entries"&&<div className="admin-content-grid"><form className="entry-editor" onSubmit={saveEntry}><div className="editor-title"><h3>{editing?"Edit entry":"New entry"}</h3>{editing&&<button type="button" onClick={resetEditor}>Cancel</button>}</div><label>Page<select value={entry.section} onChange={e=>setEntry({...entry,section:e.target.value as Section})}>{sections.map(x=><option key={x}>{x}</option>)}</select></label><label>Title<input value={entry.title} onChange={e=>setEntry({...entry,title:e.target.value})} required maxLength={160}/></label><label>Thumbnail summary<textarea rows={3} value={entry.excerpt} onChange={e=>setEntry({...entry,excerpt:e.target.value})} required maxLength={360}/></label><label>Full article<textarea rows={9} value={entry.body} onChange={e=>setEntry({...entry,body:e.target.value})} required/></label><div className="entry-row"><label>Order<input type="number" value={entry.sort_order} onChange={e=>setEntry({...entry,sort_order:Number(e.target.value)})}/></label><label className="publish-check"><input type="checkbox" checked={entry.published} onChange={e=>setEntry({...entry,published:e.target.checked})}/> Published</label></div><label className="upload-field"><Upload/>{editing?"Replace article image":"Article image"}<input type="file" accept="image/*" onChange={e=>{setImage(e.target.files?.[0]||null);setCrop({zoom:1,x:0,y:0})}}/><small>{editing&&editing.image_url?"The current image stays unless you choose a replacement. ":""}New images are cropped to 16:10 and converted to WebP under 2 MB.</small></label>{imagePreview&&<div className="crop-workspace"><div className="crop-heading"><strong>Adjust image framing</strong><button type="button" onClick={()=>setCrop({zoom:1,x:0,y:0})}><RotateCcw/>Reset</button></div><div className="crop-preview"><img src={imagePreview} alt="Crop preview" style={{transform:`translate(${crop.x*.22}%,${crop.y*.22}%) scale(${crop.zoom})`}}/><span>Thumbnail and carousel preview</span></div><label>Zoom<input type="range" min="1" max="2.5" step=".01" value={crop.zoom} onChange={e=>setCrop({...crop,zoom:Number(e.target.value)})}/></label><label>Move horizontally<input type="range" min="-100" max="100" value={crop.x} onChange={e=>setCrop({...crop,x:Number(e.target.value)})}/></label><label>Move vertically<input type="range" min="-100" max="100" value={crop.y} onChange={e=>setCrop({...crop,y:Number(e.target.value)})}/></label></div>}<div className="editor-actions"><button className="btn btn-primary" disabled={saving}><Save/>{editing?"Save changes":"Publish entry"}</button>{editing&&<button className="btn admin-cancel" type="button" onClick={resetEditor}>Cancel</button>}</div></form><div className="managed-entries"><h3>All content</h3>{!entries.length&&<p>No entries yet.</p>}{entries.map(item=><article key={item.id}>{item.image_url?<img src={item.image_url} alt=""/>:<span className="entry-placeholder"><FileText/></span>}<div><small>{item.section} · {item.published?"Published":"Draft"}</small><strong>{item.title}</strong><p>{item.excerpt}</p></div><span className="manage-actions"><button onClick={()=>startEdit(item)} aria-label={`Edit ${item.title}`} title="Edit entry"><Pencil/></button><button onClick={()=>deleteEntry(item)} aria-label={`Delete ${item.title}`} title="Delete entry"><Trash2/></button></span></article>)}</div></div>}
    {tab==="settings"&&<div className="editor-card settings-editor">{Object.entries(settings).map(([key,value])=><label key={key}>{key.replaceAll("_"," ")}<textarea rows={key.endsWith("intro")?3:1} value={value} onChange={e=>setSettings({...settings,[key]:e.target.value})}/></label>)}<button className="btn btn-primary" disabled={saving} onClick={saveSettings}><Save/>Save page content</button></div>}
    {tab==="inquiries"&&<div className="inquiry-list">{!inquiries.length&&<p>No RFQ requests received yet.</p>}{inquiries.map(item=><article key={item.id}><div><select value={item.status} onChange={e=>updateStatus(item,e.target.value as Inquiry["status"])}><option>new</option><option>contacted</option><option>confirmed</option><option>closed</option></select><small>{new Date(item.created_at).toLocaleDateString()}</small></div><h3>{item.name}</h3><p>{item.organization||"No organization"} · {item.event_type||"General inquiry"}</p><p>{item.message}</p><div className="inquiry-actions"><a href={`mailto:${item.email}`}>{item.email}</a><button onClick={()=>deleteInquiry(item)}><Trash2/>Delete</button></div></article>)}</div>}
    {note&&<div className="admin-toast">{note}</div>}
  </section></main>;
}
