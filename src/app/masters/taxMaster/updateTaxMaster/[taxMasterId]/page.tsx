import UpdateTaxMaster from "@/components/masters/taxMaster/updateTaxMaster/updateTaxMaster";

export default function EditPage({ params }: { params: { id: string } }) {
    return (
        <>
            <UpdateTaxMaster taxMasterId={params.id} />
        </>
    );
}
