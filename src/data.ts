import {createClient} from "@supabase/supabase-js";

export const OWNER_EMAIL="mr.fivetheteacher@gmail.com";

const url=import.meta.env.VITE_SUPABASE_URL||import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const key=import.meta.env.VITE_SUPABASE_ANON_KEY||import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase=url&&key?createClient(url,key):null;

export type Section="portfolio"|"foundation"|"topics"|"highlights"|"projects";
export type Entry={
  id:string;
  section:Section;
  title:string;
  excerpt:string;
  body:string;
  image_url:string|null;
  image_path:string|null;
  sort_order:number;
  published:boolean;
  created_at:string;
};

export type Inquiry={
  id:string;
  name:string;
  email:string;
  organization:string|null;
  event_type:string|null;
  preferred_date:string|null;
  audience_size:number|null;
  message:string;
  status:"new"|"contacted"|"confirmed"|"closed";
  created_at:string;
};

export const defaultSettings={
  headline:"Communication That Moves People.",
  intro:"Helping leaders, educators, and organizations communicate with clarity, confidence, and purpose.",
  contact_email:OWNER_EMAIL,
  booking_url:"",
  portfolio_heading:"Messages designed to create movement.",
  portfolio_intro:"Ariem works with institutions, leaders, and learning communities to shape communication that is human, strategic, and memorable.",
  foundation_heading:"Clarity first. Purpose always.",
  foundation_intro:"Every engagement begins with the audience, the outcome, and the message that connects them.",
  topics_heading:"Practical ideas, delivered with impact.",
  topics_intro:"Practical frameworks and memorable insights tailored to each audience.",
  highlights_heading:"Built for the room, remembered beyond it.",
  highlights_intro:"Communication that creates clarity, confidence, and forward movement.",
  projects_heading:"Talks, workshops, and communication programs.",
  projects_intro:"Custom-built sessions for conferences, leadership teams, schools, and institutional events.",
  contact_heading:"Start a meaningful conversation.",
  contact_intro:"For speaking engagements, partnerships, and institutional programs, send an inquiry and the team will respond.",
  contact_card_title:"Speaking engagements",
  schedule_heading:"Let’s plan an engagement that fits your audience.",
  schedule_intro:"Tell us about your event and preferred schedule through the RFQ form.",
  schedule_card_title:"Request a schedule",
  schedule_card_text:"The team will review your preferred date and confirm availability.",
};

export type Settings=typeof defaultSettings;

export async function getSettings():Promise<Settings>{
  if(!supabase)return defaultSettings;
  const {data}=await supabase.from("site_settings").select("key,value");
  if(!data)return defaultSettings;
  return data.reduce((all,row)=>({...all,[row.key]:row.value}),{...defaultSettings}) as Settings;
}

export async function getEntries(section:Section,includeDrafts=false):Promise<Entry[]>{
  if(!supabase)return [];
  let query=supabase.from("content_entries").select("*").eq("section",section).order("sort_order").order("created_at",{ascending:false});
  if(!includeDrafts)query=query.eq("published",true);
  const {data}=await query;
  return (data||[]) as Entry[];
}
