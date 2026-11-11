import { Card } from "@/components/ui/card";
import { MapPin, Briefcase } from "lucide-react";
import type { User } from "@shared/schema";

interface ProfileCardProps {
  user: User;
  className?: string;
  showFullInfo?: boolean;
}

export default function ProfileCard({ user, className = "", showFullInfo = true }: ProfileCardProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <div className="relative">
        <img 
          src={user.photoUrl} 
          alt={user.name}
          className="w-full h-80 object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
          <h3 className="text-2xl font-bold mb-1">{user.name}</h3>
          <p className="text-lg mb-2">{user.age}세</p>
          {showFullInfo && (
            <>
              <p className="text-sm opacity-90 mb-2">{user.bio}</p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-xs flex items-center">
                  <MapPin className="w-3 h-3 mr-1" />
                  {user.location}
                </span>
                <span className="text-xs flex items-center">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {user.occupation}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
