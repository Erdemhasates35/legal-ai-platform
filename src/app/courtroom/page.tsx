import { requireApprovedUser } from "@/lib/auth/guards";
import CourtroomClient from "./CourtroomClient";
export const dynamic="force-dynamic";
export default async function CourtroomPage(){await requireApprovedUser();return <CourtroomClient/>}
