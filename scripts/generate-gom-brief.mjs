import OpenAI from "openai";
import fs from "fs";
import path from "path";

if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured.");
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const today = new Date().toISOString().slice(0, 10);

const schema = {
  type: "object", additionalProperties: false,
  required: ["schema_version","date","sector","title","executive_summary","developments","portfolio_implications","risks","opportunities","watch_items","sources","confidence","publication_status"],
  properties: {
    schema_version: { type: "string", enum: ["1.0"] },
    date: { type: "string" }, sector: { type: "string", enum: ["energy"] }, title: { type: "string" }, executive_summary: { type: "string" },
    developments: { type: "array", minItems: 3, maxItems: 8, items: { type: "object", additionalProperties: false, required: ["headline","summary","why_it_matters","markets","confidence"], properties: { headline:{type:"string"}, summary:{type:"string"}, why_it_matters:{type:"string"}, markets:{type:"array",items:{type:"string"}}, confidence:{type:"string",enum:["high","medium","low"]} } } },
    portfolio_implications:{type:"array",minItems:1,maxItems:8,items:{type:"string"}}, risks:{type:"array",minItems:1,maxItems:8,items:{type:"string"}}, opportunities:{type:"array",minItems:1,maxItems:8,items:{type:"string"}}, watch_items:{type:"array",minItems:3,maxItems:5,items:{type:"string"}},
    sources:{type:"array",minItems:3,maxItems:20,items:{type:"object",additionalProperties:false,required:["title","url","publisher"],properties:{title:{type:"string"},url:{type:"string"},publisher:{type:"string"}}}},
    confidence:{type:"string",enum:["high","medium","low"]}, publication_status:{type:"string",enum:["validated"]}
  }
};

const prompt = `Produce today's Global Oil Markets executive daily brief for ${today}.\n\nAudience: institutional energy professionals, traders, refiners, investors, infrastructure operators, government users, and Global Oil Markets leadership.\n\nCover crude, refined products, diesel/gasoil, gasoline, Jet A-1, SAF when material, LNG/LPG when material, inventories/storage, refining, physical flows, freight/shipping, sanctions/policy, infrastructure, pricing transmission, and chokepoint risk. Emphasize US Gulf Coast, ARA/Rotterdam, Fujairah, Jurong, Caspian/Ceyhan, Red Sea, Suez, Panama, Cape of Good Hope, and Africa spillovers when material.\n\nRules: use web research; prefer primary/high-authority sources; never invent prices, outages, cargo movements, inventories, policy decisions, or company actions; omit unsupported claims; distinguish fact from inference; explain physical-market and pricing implications; return source URLs actually used; publication_status must be validated only if all rules are satisfied.`;

const response = await client.responses.create({
  model: "gpt-5",
  tools: [{ type: "web_search", search_context_size: "high" }],
  input: prompt,
  text: { format: { type: "json_schema", name: "gom_daily_brief", strict: true, schema } }
});
if (!response.output_text) throw new Error("OpenAI returned no brief output.");
const brief = JSON.parse(response.output_text);
brief.date = today;
const distinct = new Set(brief.sources.map(s => s.url).filter(Boolean));
if (distinct.size < 3) throw new Error("Fewer than three distinct source URLs were returned.");
const outDir = path.join("assets","data","briefs");
fs.mkdirSync(outDir,{recursive:true});
const rendered = JSON.stringify(brief,null,2)+"\\n";
fs.writeFileSync(path.join(outDir,`${today}.json`),rendered);
fs.writeFileSync(path.join(outDir,"latest.json"),rendered);
console.log(`Wrote ${today}.json and latest.json`);
