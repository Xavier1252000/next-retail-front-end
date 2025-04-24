import { AuroraBackgroundDemo } from "@/components/aurora-background";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default function Home() {

  const token = async function(){
    const cookieStore = cookies();
    return (await cookieStore).get('auth_token')?.value;
  }
  
  if (!token) {
    redirect('/login');
  }
  return (
    <>
    <AuroraBackgroundDemo />
    </>
  );
}
