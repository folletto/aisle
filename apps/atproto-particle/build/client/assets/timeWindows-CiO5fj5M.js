import{r as m}from"./chunk-LFPYN7LY-0BfsW2AI.js";/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),g=(...r)=>r.filter((e,t,u)=>!!e&&e.trim()!==""&&u.indexOf(e)===t).join(" ").trim();/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var v={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=m.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:u,className:s="",children:n,iconNode:a,...c},i)=>m.createElement("svg",{ref:i,...v,width:e,height:e,stroke:r,strokeWidth:u?Number(t)*24/Number(e):t,className:g("lucide",s),...c},[...a.map(([o,h])=>m.createElement(o,h)),...Array.isArray(n)?n:[n]]));/**
 * @license lucide-react v0.469.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const H=(r,e)=>{const t=m.forwardRef(({className:u,...s},n)=>m.createElement(p,{ref:n,iconNode:e,className:g(`lucide-${D(r)}`,u),...s}));return t.displayName=`${r}`,t};function f(r){return[...r].sort((e,t)=>e.hour!==t.hour?e.hour-t.hour:e.minute-t.minute)}function w(r){return r.hour*60+r.minute}function x(r){const e=r.hour%12||12,t=r.minute.toString().padStart(2,"0"),u=r.hour<12?"AM":"PM";return`${e}:${t} ${u}`}function M(r,e=new Date){if(r.length===0)throw new Error("At least one interval is required");const t=f(r),u=e.getHours()*60+e.getMinutes();let s=-1;for(let o=t.length-1;o>=0;o--)if(w(t[o])<=u){s=o;break}const n=new Date(e);if(n.setSeconds(0,0),s===-1){const o=t[t.length-1],h=t.length>1?t[t.length-2]:t[t.length-1],d=new Date(n);d.setDate(d.getDate()-1),d.setHours(o.hour,o.minute,0,0);const l=new Date(n);return t.length>1?(l.setDate(l.getDate()-1),l.setHours(h.hour,h.minute,0,0)):(l.setDate(l.getDate()-2),l.setHours(h.hour,h.minute,0,0)),{start:l,end:d}}const a=t[s],c=new Date(n);c.setHours(a.hour,a.minute,0,0);let i;if(s===0){const o=t[t.length-1];i=new Date(n),i.setDate(i.getDate()-1),i.setHours(o.hour,o.minute,0,0)}else{const o=t[s-1];i=new Date(n),i.setHours(o.hour,o.minute,0,0)}return{start:i,end:c}}function $(r,e=new Date){const t=f(r),u=e.getHours()*60+e.getMinutes();for(const a of t)if(w(a)>u){const c=new Date(e);return c.setHours(a.hour,a.minute,0,0),{interval:a,date:c}}const s=t[0],n=new Date(e);return n.setDate(n.getDate()+1),n.setHours(s.hour,s.minute,0,0),{interval:s,date:n}}export{H as c,x as f,$ as g,M as r,f as s};
