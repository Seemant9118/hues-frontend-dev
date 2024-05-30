// "use client";
// import Wrapper from "@/components/wrappers/Wrapper";
// import { Button } from "@/components/ui/button";
// import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
// import { Eye } from "lucide-react";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// const ViewTemplate = () => {
//   const printDocument = () => {
//     const input = document.getElementById("divToPrint");
//     html2canvas(input).then((canvas) => {
//       const imgData = canvas.toDataURL("image/png");
//       const pdf = new jsPDF();
//       pdf.addImage(imgData, "PNG", 0, 0);
//       pdf.save("Template.pdf");
//     });
//   };

//   return (
//     <Dialog>
//       <DialogTrigger asChild>
//         <Button
//           variant={"blue_outline"}
//           size="sm"
//           className="text-xs gap-1 p-1.5"
//         >
//           <Eye size={16} />
//           Template
//         </Button>
//       </DialogTrigger>
//       <DialogContent>
//         <Wrapper id="divToPrint" className={"absolute left-[-999999999px]"}>
//           {/* <div className="flex items-center gap-2.5">
//         <h2 className="text-zinc-900 font-bold text-2xl">Templates</h2>
//         <p className="text-neutral-300 text-xl font-bold ">/</p>
//         <p className="text-blue-500 font-bold text-sm">
//           {params?.id.replaceAll("%20", " ")}
//         </p>
//       </div> */}
//           <div className="flex flex-col gap-4 grow">
//             <div className="grid grid-cols-2 gap-5">
//               <TemplateInfo label={"Template Name"} value={"Crocin Capsule"} />
//               <TemplateInfo
//                 label={"Company Name"}
//                 value={"R&T Pharma Private. Limited."}
//               />
//             </div>
//             <div className="flex flex-col gap-1">
//               <p className="text-sm text-grey font-bold">Description</p>
//               <p className="text-[#363940] font-medium">
//                 Lorem Ipsum is simply dummy text of the printing and typesetting
//                 industry. Lorem Ipsum has been the industry&apos;s standard
//                 dummy text ever since the 1500s, when an unknown printer took a
//                 galley of type and scrambled it to make a type specimen book
//               </p>
//             </div>

//             <div className="grid grid-cols-3 gap-5">
//               <TemplateInfo label={"Batch Id"} value={"#5F01"} />
//               <TemplateInfo label={"Expiry"} value={"22/02/2015"} />
//               <TemplateInfo label={"Weight (gms)"} value={"4560"} />
//               <TemplateInfo label={"Length"} value={"45&apos;"} />
//               <TemplateInfo label={"Breadth (cms)"} value={"5&apos;"} />
//               <TemplateInfo label={"Height (cms)"} value={"1460"} />
//               <TemplateInfo label={"Rate"} value={"450"} />
//               <TemplateInfo label={"Units"} value={"450"} />
//               <TemplateInfo label={"HSN Code"} value={"HSN456"} />
//               <TemplateInfo label={"GST (%)"} value={"18%"} />
//               <TemplateInfo label={"GST Value"} value={"1420"} />
//               <TemplateInfo label={"Amount"} value={"56,780"} />
//             </div>
//             <div className="h-[1px] bg-neutral-300 mt-auto"></div>
//             <div className="flex justify-end items-center gap-2.5">
//               <Button variant="secondary" size="sm">
//                 Close
//               </Button>
//               <Button
//                 variant="secondary"
//                 size="sm"
//                 className="bg-neutral-800/10"
//               >
//                 Edit
//               </Button>
//               <Button
//                 size="sm"
//                 className="bg-red-500 text-white hover:bg-red-600"
//               >
//                 Delete
//               </Button>
//               <Button
//                 onClick={printDocument}
//                 size="sm"
//                 className="bg-red-500 text-white hover:bg-red-600"
//               >
//                 Download PDF
//               </Button>
//             </div>
//           </div>
//         </Wrapper>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default ViewTemplate;
// function TemplateInfo({ label, value }) {
//   return (
//     <div className="flex flex-col gap-1">
//       <p className="text-sm text-grey font-bold">{label}</p>
//       <p className="text-[#363940] font-bold">{value}</p>
//     </div>
//   );
// }
