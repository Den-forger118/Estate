import { redirect } from "next/navigation";

export default function GatePassRedirect() {
  redirect("/community/visitor-reg");
}
