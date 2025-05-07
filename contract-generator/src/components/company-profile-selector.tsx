"use client";

import { useState } from 'react';
import { useCompanyProfileStore } from '@/lib/company-profile-store';
import { CompanyProfile, prefixToCompanyType } from '@/types/company-profile';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Building2, User } from 'lucide-react';

interface CompanyProfileSelectorProps {
  groupKey: string;
  onSelect: (profileId: string) => void;
}

export function CompanyProfileSelector({ groupKey, onSelect }: CompanyProfileSelectorProps) {
  const [open, setOpen] = useState(false);
  const companyType = prefixToCompanyType[groupKey];
  
  const { 
    profiles, 
    getProfilesByType, 
    getDefaultProfile 
  } = useCompanyProfileStore();
  
  const companyProfiles = getProfilesByType(companyType);
  const defaultProfile = getDefaultProfile(companyType);
  
  const handleSelect = (profileId: string) => {
    onSelect(profileId);
    setOpen(false);
  };
  
  const getProfileIcon = (type: CompanyProfile['type']) => {
    switch (type) {
      case 'buyer':
      case 'seller':
      case 'employer':
        return <Building2 className="h-4 w-4 mr-2" />;
      case 'employee':
        return <User className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };
  
  const getProfileTypeName = (type: CompanyProfile['type']) => {
    switch (type) {
      case 'buyer': return 'Kupující';
      case 'seller': return 'Prodávající';
      case 'employer': return 'Zaměstnavatel';
      case 'employee': return 'Pracovník';
      default: return type;
    }
  };
  
  if (!companyType) return null;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-4 w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Použít uložený profil
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vyberte profil {getProfileTypeName(companyType)}</DialogTitle>
          <DialogDescription>
            Vyberte uložený profil pro předvyplnění údajů.
          </DialogDescription>
        </DialogHeader>
        
        {companyProfiles.length > 0 ? (
          <div className="space-y-4 py-4">
            {companyProfiles.map(profile => (
              <div 
                key={profile.id} 
                className={`flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-muted transition-colors ${profile.isDefault ? 'border-primary' : ''}`}
                onClick={() => handleSelect(profile.id)}
              >
                <div className="flex items-center">
                  {getProfileIcon(profile.type)}
                  <div>
                    <div className="font-medium">{profile.name}</div>
                    <div className="text-sm text-muted-foreground">{profile.data.address}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profile.isDefault && (
                    <Badge variant="outline" className="text-xs">Výchozí</Badge>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(profile.id);
                    }}
                  >
                    Použít
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-muted-foreground">Nemáte žádné uložené profily tohoto typu.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setOpen(false);
                // TODO: Navigate to profile management page
              }}
            >
              Vytvořit nový profil
            </Button>
          </div>
        )}
        
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            onClick={() => setOpen(false)}
          >
            Zrušit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
