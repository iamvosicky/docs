"use client";

import { useState } from "react";
import { useCompanyProfileStore } from "@/lib/company-profile-store";
import { CompanyProfile } from "@/types/company-profile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/sonner";
import { Building2, User, Pencil, Trash2, Star, StarOff, Plus } from "lucide-react";

export default function ProfilesPage() {
  const { profiles, addProfile, updateProfile, deleteProfile, setDefaultProfile } = useCompanyProfileStore();
  const [activeTab, setActiveTab] = useState<CompanyProfile['type']>('buyer');
  const [editingProfile, setEditingProfile] = useState<CompanyProfile | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newProfile, setNewProfile] = useState<Partial<CompanyProfile>>({
    name: '',
    type: 'buyer',
    data: {
      name: '',
      address: '',
      ico: '',
      dic: '',
      email: '',
      phone: '',
      bankAccount: '',
      contactPerson: ''
    },
    isDefault: false
  });

  const filteredProfiles = profiles.filter(profile => profile.type === activeTab);

  const handleAddProfile = () => {
    if (!newProfile.name || !newProfile.data?.name || !newProfile.data?.address || !newProfile.data?.ico) {
      toast.error("Vyplňte prosím všechna povinná pole");
      return;
    }

    addProfile(newProfile as Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>);
    setIsAddDialogOpen(false);
    toast.success("Profil byl úspěšně vytvořen");
    
    // Reset form
    setNewProfile({
      name: '',
      type: activeTab,
      data: {
        name: '',
        address: '',
        ico: '',
        dic: '',
        email: '',
        phone: '',
        bankAccount: '',
        contactPerson: ''
      },
      isDefault: false
    });
  };

  const handleEditProfile = () => {
    if (!editingProfile) return;
    
    updateProfile(editingProfile.id, editingProfile);
    setIsEditDialogOpen(false);
    toast.success("Profil byl úspěšně aktualizován");
  };

  const handleDeleteProfile = () => {
    if (!editingProfile) return;
    
    deleteProfile(editingProfile.id);
    setIsDeleteDialogOpen(false);
    toast.success("Profil byl úspěšně smazán");
  };

  const handleSetDefault = (profile: CompanyProfile) => {
    setDefaultProfile(profile.id, profile.type);
    toast.success(`Profil ${profile.name} byl nastaven jako výchozí`);
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

  const getProfileIcon = (type: CompanyProfile['type']) => {
    switch (type) {
      case 'buyer':
      case 'seller':
      case 'employer':
        return <Building2 className="h-5 w-5" />;
      case 'employee':
        return <User className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Správa profilů</h1>
        <p className="text-muted-foreground text-lg">
          Spravujte uložené profily pro předvyplnění formulářů
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as CompanyProfile['type'])}>
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="buyer">Kupující</TabsTrigger>
          <TabsTrigger value="seller">Prodávající</TabsTrigger>
          <TabsTrigger value="employer">Zaměstnavatel</TabsTrigger>
          <TabsTrigger value="employee">Pracovník</TabsTrigger>
        </TabsList>

        <div className="flex justify-end mb-6">
          <Button onClick={() => {
            setNewProfile({
              ...newProfile,
              type: activeTab
            });
            setIsAddDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Přidat profil
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map(profile => (
              <Card key={profile.id} className={`shadow-sm hover:shadow-md transition-shadow ${profile.isDefault ? 'border-primary' : ''}`}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center">
                    {getProfileIcon(profile.type)}
                    <div className="ml-2">
                      <CardTitle className="text-xl">{profile.name}</CardTitle>
                      <CardDescription>{getProfileTypeName(profile.type)}</CardDescription>
                    </div>
                  </div>
                  {profile.isDefault && (
                    <Badge variant="outline" className="ml-2">Výchozí</Badge>
                  )}
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Název:</span> {profile.data.name}</p>
                    <p><span className="font-medium">Adresa:</span> {profile.data.address}</p>
                    <p><span className="font-medium">IČO:</span> {profile.data.ico}</p>
                    {profile.data.dic && <p><span className="font-medium">DIČ:</span> {profile.data.dic}</p>}
                    {profile.data.email && <p><span className="font-medium">Email:</span> {profile.data.email}</p>}
                    {profile.data.phone && <p><span className="font-medium">Telefon:</span> {profile.data.phone}</p>}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-4">
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setEditingProfile(profile);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Upravit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setEditingProfile(profile);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Smazat
                    </Button>
                  </div>
                  {!profile.isDefault && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleSetDefault(profile)}
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Nastavit jako výchozí
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground mb-4">Nemáte žádné uložené profily tohoto typu</p>
              <Button onClick={() => {
                setNewProfile({
                  ...newProfile,
                  type: activeTab
                });
                setIsAddDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Přidat profil
              </Button>
            </div>
          )}
        </div>
      </Tabs>

      {/* Add Profile Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Přidat nový profil</DialogTitle>
            <DialogDescription>
              Vytvořte nový profil pro předvyplnění formulářů
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Název profilu</Label>
              <Input 
                id="profile-name" 
                value={newProfile.name} 
                onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-name">Název společnosti/osoby *</Label>
              <Input 
                id="company-name" 
                value={newProfile.data?.name || ''} 
                onChange={(e) => setNewProfile({
                  ...newProfile, 
                  data: {...newProfile.data, name: e.target.value}
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-address">Adresa *</Label>
              <Input 
                id="company-address" 
                value={newProfile.data?.address || ''} 
                onChange={(e) => setNewProfile({
                  ...newProfile, 
                  data: {...newProfile.data, address: e.target.value}
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-ico">IČO *</Label>
              <Input 
                id="company-ico" 
                value={newProfile.data?.ico || ''} 
                onChange={(e) => setNewProfile({
                  ...newProfile, 
                  data: {...newProfile.data, ico: e.target.value}
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company-dic">DIČ</Label>
              <Input 
                id="company-dic" 
                value={newProfile.data?.dic || ''} 
                onChange={(e) => setNewProfile({
                  ...newProfile, 
                  data: {...newProfile.data, dic: e.target.value}
                })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="is-default" 
                checked={newProfile.isDefault} 
                onCheckedChange={(checked) => setNewProfile({
                  ...newProfile, 
                  isDefault: checked as boolean
                })}
              />
              <Label htmlFor="is-default">Nastavit jako výchozí</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Zrušit</Button>
            <Button onClick={handleAddProfile}>Přidat profil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upravit profil</DialogTitle>
            <DialogDescription>
              Upravte údaje profilu
            </DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-profile-name">Název profilu</Label>
                <Input 
                  id="edit-profile-name" 
                  value={editingProfile.name} 
                  onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-name">Název společnosti/osoby *</Label>
                <Input 
                  id="edit-company-name" 
                  value={editingProfile.data.name} 
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    data: {...editingProfile.data, name: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-address">Adresa *</Label>
                <Input 
                  id="edit-company-address" 
                  value={editingProfile.data.address} 
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    data: {...editingProfile.data, address: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-ico">IČO *</Label>
                <Input 
                  id="edit-company-ico" 
                  value={editingProfile.data.ico} 
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    data: {...editingProfile.data, ico: e.target.value}
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company-dic">DIČ</Label>
                <Input 
                  id="edit-company-dic" 
                  value={editingProfile.data.dic || ''} 
                  onChange={(e) => setEditingProfile({
                    ...editingProfile, 
                    data: {...editingProfile.data, dic: e.target.value}
                  })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Zrušit</Button>
            <Button onClick={handleEditProfile}>Uložit změny</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Smazat profil</DialogTitle>
            <DialogDescription>
              Opravdu chcete smazat tento profil? Tato akce je nevratná.
            </DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <div className="py-4">
              <p className="font-medium">{editingProfile.name}</p>
              <p className="text-sm text-muted-foreground">{editingProfile.data.name}</p>
              <p className="text-sm text-muted-foreground">{editingProfile.data.address}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Zrušit</Button>
            <Button variant="destructive" onClick={handleDeleteProfile}>Smazat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
