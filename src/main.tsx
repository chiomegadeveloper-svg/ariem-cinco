import React,{useState}from"react";
import{createRoot}from"react-dom/client";
import{CalendarDays,Mail,Menu,Send,X}from"lucide-react";
import"../app/globals.css";
import"../app/admin.css";
import"./overrides.css";
import{Admin}from"./admin";
import{EntryGrid,PortfolioCarousel,useSiteSettings}from"./content";
import{OWNER_EMAIL,supabase}from"./data";

const nav=["Portfolio","Foundation","Topics","Highlights","Projects","Contact","RFQ"];

function Header(){
  const[open,setOpen]=useState(false),path=location.pathname;
  return <header className="site-header dark-header"><a className="brand transparent-brand" href="/"><img src="/brand/ariem-logo.png" alt="Ariem Cinco"/></a><nav>{nav.map(label=>{const href=`/${label.toLowerCase()}`;return <a className={path===href?"active":""} key={label} href={href}>{label}</a>})}</nav><a className="btn btn-primary header-cta" href="/schedule">Schedule a call</a><button className="menu-toggle" onClick={()=>setOpen(true)} aria-label="Open navigation"><Menu/></button>{open&&<div className="mobile-menu"><button onClick={()=>setOpen(false)} aria-label="Close navigation"><X/></button><span>Navigate</span>{nav.map(label=><a key={label} href={`/${label.toLowerCase()}`}>{label}</a>)}<a className="btn btn-primary" href="/schedule">Schedule a call</a></div>}</header>;
}

function Footer(){
  const settings=useSiteSettings(),email=settings.contact_email||OWNER_EMAIL;
  return <footer className="professional-footer"><div className="footer-brand"><img src="/brand/ariem-logo.png" alt="Ariem Cinco"/><p>Communication that moves people.</p></div><div className="footer-links"><strong>Professional links</strong><nav><a href="/portfolio">Portfolio</a><a href="/topics">Speaking topics</a><a href="/contact">Contact</a><a href="/rfq">Request a quotation</a></nav></div><div className="footer-contact"><strong>Connect</strong><a href={`mailto:${email}`}><Mail size={16}/>{email}</a><a href="/control-center">Owner control center</a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Ariem Cinco. All rights reserved.</span><a className="developer-badge" href="https://archieomega.pro" target="_blank" rel="noreferrer"><span>Developed by</span><span className="developer-logo"><img src="/brand/kurama-developer.png" alt="Kurama Information Technology Solutions"/></span><b>KURAMA INFORMATION TECHNOLOGY SOLUTIONS</b></a></div></footer>;
}

function Shell({children}:{children:React.ReactNode}){return <><Header/><main className="page-main">{children}</main><Footer/></>}

function Home(){
  const settings=useSiteSettings();
  return <><Header/><main><section className="hero"><div className="portrait-wrap"><img className="portrait plain" src="/brand/ariem-portrait.png" alt="Ariem Cinco"/></div><div className="hero-copy"><div className="hero-mark">AC</div><PortfolioCarousel/><p className="eyebrow"><span/>Resource Speaker • Communication Strategist</p><h1>{settings.headline}</h1><p className="lead">{settings.intro}</p><div className="speaker-lockup"><span/><div><strong>Ariem Cinco</strong><small>Resource Speaker</small></div></div><div className="hero-actions"><a className="btn btn-primary" href="/schedule">Schedule a call</a><a className="btn btn-outline" href="/rfq">RFQ</a></div></div></section></main><Footer/></>;
}

function Portfolio(){const settings=useSiteSettings();return <Shell><section className="section dynamic-page portfolio-page"><div className="section-heading"><p className="kicker">Selected work</p><h2>{settings.portfolio_heading}</h2><p>{settings.portfolio_intro}</p></div><EntryGrid section="portfolio"/></section></Shell>}
function Foundation(){const settings=useSiteSettings();return <Shell><section className="section foundation dynamic-page"><div className="section-heading"><p className="kicker">Foundation</p><h2>{settings.foundation_heading}</h2><p>{settings.foundation_intro}</p></div><EntryGrid section="foundation"/></section></Shell>}
function Topics(){const settings=useSiteSettings();return <Shell><section className="section light-section dynamic-page"><div className="section-heading"><p className="kicker">Speaking topics</p><h2>{settings.topics_heading}</h2><p>{settings.topics_intro}</p></div><EntryGrid section="topics" variant="light"/></section></Shell>}
function Highlights(){const settings=useSiteSettings();return <Shell><section className="section highlights dynamic-page"><div className="section-heading"><p className="kicker">Highlights</p><h2>{settings.highlights_heading}</h2><p>{settings.highlights_intro}</p></div><EntryGrid section="highlights"/></section></Shell>}
function Projects(){const settings=useSiteSettings();return <Shell><section className="section projects dynamic-page"><div className="section-heading"><p className="kicker">Projects</p><h2>{settings.projects_heading}</h2><p>{settings.projects_intro}</p></div><EntryGrid section="projects"/></section></Shell>}

function Contact(){
  const settings=useSiteSettings(),email=settings.contact_email||OWNER_EMAIL;
  return <Shell><section className="section schedule page-fill"><div><p className="kicker">Contact</p><h2>{settings.contact_heading}</h2><p>{settings.contact_intro}</p></div><div className="schedule-card"><Mail/><h3>{settings.contact_card_title}</h3><p>{email}</p><a className="btn btn-primary" href={`mailto:${email}`}>Send email</a></div></section></Shell>;
}

function RFQ(){
  const[note,setNote]=useState("");
  async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setNote("Sending…");if(!supabase)return setNote("Connect Supabase to activate requests.");const form=e.currentTarget,{error}=await supabase.from("inquiries").insert(Object.fromEntries(new FormData(form).entries()));if(error)setNote(error.message);else{form.reset();setNote("Thank you. Your request has been received.")}}
  return <Shell><section className="section inquiry-section page-fill"><div><p className="kicker">Request for quotation</p><h2>Share your event details.</h2><p>Your request will be delivered directly to the owner control center.</p></div><form className="inquiry-form" onSubmit={submit}><label>Full name<input name="name" required/></label><label>Email<input name="email" type="email" required/></label><label>Organization<input name="organization"/></label><label>Event type<select name="event_type"><option>Conference keynote</option><option>Workshop</option><option>Leadership session</option><option>School engagement</option></select></label><label>Preferred date<input name="preferred_date" type="date"/></label><label>Audience size<input name="audience_size" type="number"/></label><label className="full">Message<textarea name="message" rows={5} required/></label><button className="btn btn-primary full"><Send size={17}/>Send request</button>{note&&<p className="form-note">{note}</p>}</form></section></Shell>;
}

function Schedule(){const settings=useSiteSettings();return <Shell><section className="section schedule page-fill"><div><p className="kicker">Schedule a call</p><h2>{settings.schedule_heading}</h2><p>{settings.schedule_intro}</p></div><div className="schedule-card"><CalendarDays/><h3>{settings.schedule_card_title}</h3><p>{settings.schedule_card_text}</p><a className="btn btn-primary" href={settings.booking_url||"/rfq"}>{settings.booking_url?"Open booking page":"Continue to RFQ"}</a></div></section></Shell>}

const routes:Record<string,React.ReactNode>={"/":<Home/>,"/portfolio":<Portfolio/>,"/foundation":<Foundation/>,"/topics":<Topics/>,"/highlights":<Highlights/>,"/projects":<Projects/>,"/contact":<Contact/>,"/rfq":<RFQ/>,"/schedule":<Schedule/>,"/control-center":<Admin/>};
if("serviceWorker"in navigator)navigator.serviceWorker.register("/sw.js");
createRoot(document.getElementById("root")!).render(routes[location.pathname]??<Home/>);
