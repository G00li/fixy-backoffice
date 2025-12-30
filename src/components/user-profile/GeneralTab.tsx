import UserAddressCard from "./UserAddressCard";
import UserInfoCard from "./UserInfoCard";
import UserMetaCard from "./UserMetaCard";

interface GeneralTabProps {
  profile: {
    id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
    bio: string | null;
    role: string | null;
    username: string | null;
    postal_code: string | null;
    location_text: string | null;
    address: any;
  };
}

export default function GeneralTab({ profile }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <UserMetaCard profile={profile} />
      <UserInfoCard profile={profile} />
      <UserAddressCard profile={profile} />
    </div>
  );
}
