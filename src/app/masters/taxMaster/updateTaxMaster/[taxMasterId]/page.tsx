import UpdateTaxMaster from "@/components/masters/taxMaster/updateTaxMaster/updateTaxMaster";

async function Page({params}:{params:Promise<{taxMasterId:string}>}) {
  const taxMasterId = (await params).taxMasterId;

  return (
    <div>
      <UpdateTaxMaster taxMasterId={taxMasterId} />
    </div>
  );
}

export default Page;
