import { getSession } from "@/lib/auth"
import { findOwnerOccupierByBuyer } from "@/lib/repos/residents"
import { CommunityHubView } from "./CommunityViews"

export default async function CommunityPage() {
  const session = await getSession()
  const buyerId = session?.user.buyerId
  const homeowner = buyerId ? await findOwnerOccupierByBuyer(buyerId) : null

  return (
    <CommunityHubView
      residentName={homeowner?.fullName}
      unitCode={homeowner?.unitCode ?? undefined}
    />
  )
}
