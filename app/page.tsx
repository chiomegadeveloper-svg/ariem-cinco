import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CalendarDays, Mail, Mic2, Quote, Sparkles } from "lucide-react";
import { InquiryForm } from "@/components/inquiry-form";

const topics = [
  { title: "Strategic Communication", text: "Turn complex ideas into messages people understand, trust, and act on." },
  { title: "Leadership Communication", text: "Lead conversations with clarity, confidence, empathy, and purpose." },
  { title: "Public Speaking", text: "Build a compelling presence and deliver messages that stay with an audience." },
];
const highlights = [
  { value: "Leaders", label: "Clearer decisions and stronger alignment" },
  { value: "Educators", label: "More engaging and meaningful learning" },
  { value: "Teams", label: "Communication that moves work forward" },
];

export default function Home() {
  return <main>
    <header className="site-header">
      <Link className="brand" href="#home" aria-label="Ariem Cinco home"><Image src="/brand/ariem-logo.png" alt="Ariem Cinco" width={210} height={115} priority /></Link>
      <nav aria-label="Main navigation"><a href="#portfolio">Portfolio</a><a href="#foundation">Foundation</a><a href="#topics">Topics</a><a href="#highlights">Highlights</a><a href="#projects">Projects</a><a href="#contact">Contact</a><a href="#rfq">RFQ</a></nav>
      <a className="btn btn-primary header-cta" href="#schedule">Schedule a call</a>
    </header>
    <section id="home" className="hero">
      <div className="portrait-wrap"><Image className="portrait" src="/brand/ariem-portrait.png" alt="Ariem Cinco in a corporate suit" fill priority sizes="(max-width: 780px) 100vw, 48vw" /></div>
      <div className="hero-copy"><div className="hero-mark">AC</div><p className="eyebrow"><span />Resource Speaker • Communication Strategist</p><h1>Communication<br />That Moves People.</h1><p className="lead">Helping leaders, educators, and organizations communicate with clarity, confidence, and purpose.</p><div className="speaker-lockup"><span /><div><strong>Ariem Cinco</strong><small>Resource Speaker</small></div></div><div className="hero-actions"><a className="btn btn-primary" href="#schedule">Schedule a call</a><a className="btn btn-outline" href="#portfolio">View portfolio</a></div></div>
    </section>
    <section id="portfolio" className="section split-section"><div><p className="kicker">Selected work</p><h2>Messages designed to create movement.</h2></div><div className="statement"><Quote size={28}/><p>Ariem works with institutions, leaders, and learning communities to shape communication that is human, strategic, and memorable.</p></div></section>
    <section id="foundation" className="section foundation"><div className="section-heading"><p className="kicker">Foundation</p><h2>Clarity first. Purpose always.</h2><p>Every engagement begins with the audience, the outcome, and the message that connects them.</p></div><div className="principles"><article><span>01</span><h3>Listen</h3><p>Understand the people, context, and real communication challenge.</p></article><article><span>02</span><h3>Shape</h3><p>Build a clear message, useful structure, and credible point of view.</p></article><article><span>03</span><h3>Move</h3><p>Deliver with confidence and create a meaningful next action.</p></article></div></section>
    <section id="topics" className="section light-section"><div className="section-heading dark-text"><p className="kicker">Speaking topics</p><h2>Practical ideas, delivered with impact.</h2></div><div className="topic-grid">{topics.map((topic,index)=><article key={topic.title}><span>0{index+1}</span><Mic2/><h3>{topic.title}</h3><p>{topic.text}</p></article>)}</div></section>
    <section id="highlights" className="section highlights"><div className="section-heading"><p className="kicker">Highlights</p><h2>Built for the room, remembered beyond it.</h2></div><div className="highlight-grid">{highlights.map(item=><article key={item.value}><strong>{item.value}</strong><p>{item.label}</p></article>)}</div></section>
    <section id="projects" className="section projects"><div className="project-feature"><Sparkles/><p className="kicker">Projects</p><h2>Talks, workshops, and communication programs.</h2><p>Custom-built sessions can support conferences, leadership teams, schools, and institutional events.</p><a href="#rfq">Request a tailored engagement <ArrowRight size={18}/></a></div></section>
    <section id="schedule" className="section schedule"><div><p className="kicker">Start a conversation</p><h2>Let’s plan an engagement that fits your audience.</h2><p>Tell us about the event, the people in the room, and what you want them to take away.</p></div><div className="schedule-card"><CalendarDays/><h3>Schedule a call</h3><p>Choose a preferred date and time through the request form. The team will confirm availability.</p><a className="btn btn-primary" href="#rfq">Request a schedule</a></div></section>
    <section id="rfq" className="section inquiry-section"><div><p className="kicker">Request for quotation</p><h2>Share your event details.</h2><p>Fields marked required help us prepare the right response.</p></div><InquiryForm/></section>
    <footer id="contact"><div className="footer-brand"><Image src="/brand/ariem-logo.png" alt="Ariem Cinco" width={180} height={100}/><p>Communication that moves people.</p></div><div><p>Speaking engagements and partnerships</p><a href="mailto:hello@ariemcinco.com"><Mail size={16}/> hello@ariemcinco.com</a></div><Link href="/control-center">Owner control center</Link></footer>
  </main>;
}
