'use client';

import React, {useState, useEffect, useRef} from 'react';
import {useRouter} from 'next/navigation';

import {useLanguage} from '@/components/LanguageProvider';
import {useAppLogo} from '@/components/AppLogoProvider';
import {
  ShieldPlus, 
  LogIn, 
  ArrowLeft, 
  LogOut, 
  Lock, 
  User, 
  Plus, 
  Pencil, 
  Trash2, 
  Image as ImageIcon,
  Upload,
  Key,
  Save,
  X,
  Leaf,
  Sparkles,
  Smile,
  Mail,
  Phone,
  LayoutDashboard,
  Search,
  Eye,
  Star
} from 'lucide-react';
import Link from 'next/link';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useToast} from '@/hooks/use-toast';
import {Label} from '@/components/ui/label';
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from '@/components/ui/table';
import {Badge} from '@/components/ui/badge';
import {Switch} from '@/components/ui/switch';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {cn} from '@/lib/utils';
import {useFirestore, useAuth, useDoc, useMemoFirebase, updateDocumentNonBlocking, setDocumentNonBlocking} from '@/firebase';
import {signInAnonymously} from 'firebase/auth';
import {doc} from 'firebase/firestore';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  code: string;
  status: 'Active' | 'Disabled';
}

interface CropItem {
  id: string;
  nameEn: string;
  nameBn: string;
  icon: string;
  isImage?: boolean;
}

const PRESET_EMOJIS = [
  '🌾', '🥔', '🍅', '🍆', '🌿', '🌶️', '🥒', '🧅', '🧄', '🌽', '🥦', '🥕', '🌱', '🥬', '✨', '🍋', '🍊', '🫑', '🍇', '🍂', '🌰', '🥜', '🍒', '🍈'
];

export default function AdminPage() {
  const {t} = useLanguage();
  const {logoUrl, setLogoUrl} = useAppLogo();
  const {toast} = useToast();
  const db = useFirestore();
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const [userIdInput, setUserIdInput] = useState('');
  const [loginCodeInput, setLoginCodeInput] = useState('');
  
  // Admin Codes
  const [newAdminCode, setNewAdminCode] = useState('');
  const [confirmAdminCode, setConfirmAdminCode] = useState('');

  // Admin Inputs
  const [oldEmailInput, setOldEmailInput] = useState('');
  const [newEmailInput, setNewEmailInput] = useState('');
  const [adminPhone, setAdminPhone] = useState('+880123456789');

  const [securityMode, setSecurityMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cropPhotoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
  setMounted(true);

  const isAdminLocal = localStorage.getItem('isAdmin') === 'true';

  if (!isAdminLocal) {
    router.push('/'); // not admin → go home
    return;
  }

  setIsAdmin(true);
}, []);
  
  // User Management State
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserCode, setNewUserCode] = useState('');
  const [generatedId, setGeneratedId] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');

  // Editing User State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserCode, setEditUserCode] = useState('');
  const [editUserIdValue, setEditUserIdValue] = useState('');
  const [editUserStatus, setEditUserStatus] = useState<'Active' | 'Disabled'>('Active');

  // Crop Management State
  const [crops, setCrops] = useState<CropItem[]>([]);
  const [newCropNameEn, setNewCropNameEn] = useState('');
  const [newCropNameBn, setNewCropNameBn] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🌱');
  const [uploadedCropPhoto, setUploadedCropPhoto] = useState<string | null>(null);
  const [cropAddMode, setCropAddMode] = useState<'emoji' | 'photo'>('emoji');
  const [showManyMore, setShowManyMore] = useState(true);

  // Stats State - Memoized reference
  const statsRef = useMemoFirebase(() => doc(db, 'stats', 'main'), [db]);
  const { data: statsData } = useDoc(statsRef);

  useEffect(() => {
    setMounted(true);
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminStatus);
    
    // Sync local states with Firestore data
    if (statsData) {
      setSecurityMode(!!statsData.securityMode);
      setAdminPhone(statsData.adminPhone || '+880123456789');
    }

    const savedUsers = localStorage.getItem('registeredUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultUsers: RegisteredUser[] = [
        { id: 'ED12345', name: 'Alice Johnson', email: 'alice@example.com', code: '1234', status: 'Active' },
      ];
      setUsers(defaultUsers);
      localStorage.setItem('registeredUsers', JSON.stringify(defaultUsers));
    }

    const savedCrops = localStorage.getItem('supportedCrops');
    if (savedCrops) {
      setCrops(JSON.parse(savedCrops));
    } else {
      const defaultCrops: CropItem[] = [
        { id: '1', nameEn: 'Cucumber', nameBn: 'শসা', icon: '🥒' },
        { id: '4', nameEn: 'Potato', nameBn: 'আলু', icon: '🥔' },
        { id: '6', nameEn: 'Tomato', nameBn: 'টমেটো', icon: '🍅' },
      ];
      setCrops(defaultCrops);
      localStorage.setItem('supportedCrops', JSON.stringify(defaultCrops));
    }

    const manyMoreStatus = localStorage.getItem('showManyMore') !== 'false';
    setShowManyMore(manyMoreStatus);
  }, [statsData]);

  if (!mounted) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const storedCode = localStorage.getItem('adminLoginCode') || 'adnan@10002';
    
    if (userIdInput === 'admin' && loginCodeInput === storedCode) {
      signInAnonymously(auth).then(() => {
        localStorage.setItem('isAdmin', 'true');
        setIsAdmin(true);
        toast({
          title: "Login Successful",
          description: "Welcome back, Admin.",
        });
      });
    } else {
      toast({
        variant: "destructive",
        title: t.invalidCredentials,
        description: "Please check your ID and Code.",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    setIsAdmin(false);
    auth.signOut();
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleUpdateCode = () => {
    if (!newAdminCode.trim() || !confirmAdminCode.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Codes cannot be empty.",
      });
      return;
    }
    if (newAdminCode !== confirmAdminCode) {
      toast({
        variant: "destructive",
        title: "Error",
        description: t.codesDoNotMatch,
      });
      return;
    }
    localStorage.setItem('adminLoginCode', newAdminCode);
    setNewAdminCode('');
    setConfirmAdminCode('');
    toast({
      title: "Success",
      description: "Admin login code updated successfully.",
    });
  };

  const handleUpdateAdminEmail = () => {
    const currentAdminEmail = statsData?.adminEmail || '315222057@hamdarduniversity.edu.bd';
    if (oldEmailInput !== currentAdminEmail) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: "Old email does not match our records.",
      });
      return;
    }
    if (!newEmailInput.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "New email cannot be empty.",
      });
      return;
    }
    
    if (statsRef) {
      setDocumentNonBlocking(statsRef, { adminEmail: newEmailInput }, { merge: true });
      toast({
        title: "Success",
        description: "Admin email updated successfully.",
      });
      setOldEmailInput('');
      setNewEmailInput('');
    }
  };

  const handleUpdateAdminPhone = () => {
    if (statsRef) {
      setDocumentNonBlocking(statsRef, { adminPhone: adminPhone }, { merge: true });
      toast({
        title: "Success",
        description: "Admin phone number updated successfully.",
      });
    }
  };

  const toggleSecurityMode = (checked: boolean) => {
    if (statsRef) {
      setDocumentNonBlocking(statsRef, { securityMode: checked }, { merge: true });
      toast({
        title: "Security Updated",
        description: `Security mode is now ${checked ? 'ON' : 'OFF'}.`,
      });
    }
  };

  const toggleShowVisitorCount = (checked: boolean) => {
    if (statsRef) {
      setDocumentNonBlocking(statsRef, { 
        showVisitorCount: checked 
      }, { merge: true });

      toast({
        title: "Viewer Option Updated",
        description: `Visitor count display is now ${checked ? 'ON' : 'OFF'}.`,
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid file",
          description: "Please upload an image file.",
        });
        return;
      }

      if (file.size > 1024 * 1024) { // 1MB Limit for Firestore Document size
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please upload an image smaller than 1MB.",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // setLogoUrl handles both optimistic UI and Firestore persistence
        setLogoUrl(result);
        toast({
          title: "Logo Updated",
          description: "Application logo has been updated globally.",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedCropPhoto(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateUserId = () => {
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    return `ED${randomDigits}`;
  };

  const startAddingUser = () => {
    setGeneratedId(generateUserId());
    setIsAddingUser(true);
  };

  const cancelAddingUser = () => {
    setIsAddingUser(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserCode('');
    setGeneratedId('');
  };

  const handleSaveUser = () => {
    if (!newUserName.trim() || !newUserCode.trim() || !newUserEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name, Email, and Login Code are required.",
      });
      return;
    }

    const newUser: RegisteredUser = {
      id: generatedId,
      name: newUserName,
      email: newUserEmail,
      code: newUserCode,
      status: 'Active',
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "User Added",
      description: `${newUserName} has been registered successfully.`,
    });

    cancelAddingUser();
  };

  const startEditingUser = (user: RegisteredUser) => {
    setEditingUserId(user.id);
    setEditUserIdValue(user.id);
    setEditUserName(user.name);
    setEditUserEmail(user.email);
    setEditUserCode(user.code);
    setEditUserStatus(user.status);
  };

  const cancelEditingUser = () => {
    setEditingUserId(null);
  };

  const handleUpdateUser = (originalId: string) => {
    if (!editUserName.trim() || !editUserCode.trim() || !editUserIdValue.trim() || !editUserEmail.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "All fields are required.",
      });
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === originalId 
        ? { id: editUserIdValue, name: editUserName, email: editUserEmail, code: editUserCode, status: editUserStatus } 
        : u
    );

    setUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    setEditingUserId(null);
    
    toast({
      title: "User Updated",
      description: `${editUserName}'s account has been updated.`,
    });
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    toast({
      title: "User Removed",
      description: "User account has been deleted.",
    });
  };

  const handleSaveCrop = () => {
    if (!newCropNameEn.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "English name is required.",
      });
      return;
    }

    const iconValue = cropAddMode === 'emoji' ? selectedEmoji : uploadedCropPhoto;
    if (!iconValue) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select an emoji or upload a photo.",
      });
      return;
    }

    const newCrop: CropItem = {
      id: Date.now().toString(),
      nameEn: newCropNameEn,
      nameBn: newCropNameBn,
      icon: iconValue,
      isImage: cropAddMode === 'photo'
    };

    const updatedCrops = [...crops, newCrop];
    setCrops(updatedCrops);
    localStorage.setItem('supportedCrops', JSON.stringify(updatedCrops));
    
    setNewCropNameEn('');
    setNewCropNameBn('');
    setUploadedCropPhoto(null);

    toast({
      title: "Crop Added",
      description: `${newCropNameEn} has been added successfully.`,
    });
  };

  const deleteCrop = (id: string) => {
    const updatedCrops = crops.filter(c => c.id !== id);
    setCrops(updatedCrops);
    localStorage.setItem('supportedCrops', JSON.stringify(updatedCrops));
    toast({
      title: "Crop Removed",
      description: "Crop has been removed.",
    });
  };

  const handleDeleteManyMore = () => {
    setShowManyMore(false);
    localStorage.setItem('showManyMore', 'false');
    toast({
      title: "Removed",
      description: "'Many More' item has been removed.",
    });
  };

  const filteredUsers = users.filter(user => 
    user.id.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  if (isAdmin) {
    return (
      <main className="min-h-screen bg-[#f8faf9] flex flex-col font-body">
        <header className="w-full bg-[#1b7d3d] text-white py-4 px-6 shadow-sm">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 hover:opacity-90">
              <div className="bg-white p-1 rounded-xl flex items-center justify-center overflow-hidden w-8 h-8">
                {logoUrl ? (
                  <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" />
                ) : (
                  <ShieldPlus className="w-6 h-6 text-[#1b7d3d]" />
                )}
              </div>
              <div>
                <h1 className="text-lg font-bold leading-none">{t.title}</h1>
                <p className="text-xs opacity-80">{t.appDescription}</p>
              </div>
            </Link>
            <Button variant="secondary" size="sm" onClick={handleLogout} className="font-bold flex gap-2 rounded-lg">
              <LogOut className="w-4 h-4" />
              {t.logout}
            </Button>
          </div>
        </header>

        <div className="flex-1 w-full max-w-7xl mx-auto px-6 py-8 space-y-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#1b7d3d]/10 rounded-xl flex items-center justify-center overflow-hidden w-12 h-12">
              <Star className="w-8 h-8 text-[#1b7d3d]" />
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-[#1b7d3d]">{t.adminDashboard}</h2>
              <p className="text-muted-foreground">{t.adminDashboardDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Tabs defaultValue="users" className="w-full">
                <TabsList className="bg-white border p-1 h-12 rounded-2xl mb-4 w-full justify-start gap-2">
                  <TabsTrigger value="users" className="rounded-xl px-6 data-[state=active]:bg-[#1b7d3d] data-[state=active]:text-white">
                    <User className="w-4 h-4 mr-2" />
                    {t.registeredUsers}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="m-0">
                  <Card className="border-[#e1e9e4] shadow-sm rounded-2xl overflow-hidden bg-white">
                    <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-[#1b7d3d]" />
                        <CardTitle className="text-xl font-bold">{t.registeredUsers}</CardTitle>
                      </div>
                      
                      <div className="flex flex-col md:flex-row items-center gap-3">
                        <div className="relative w-full md:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input 
                            placeholder="Search by ID or Name..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="pl-9 h-10 bg-[#f8faf9] border-[#e1e9e4] rounded-xl focus:ring-[#1b7d3d]"
                          />
                        </div>
                        <Button 
                          onClick={startAddingUser}
                          className="w-full md:w-auto bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold flex gap-2 rounded-lg h-10"
                          disabled={isAddingUser}
                        >
                          <Plus className="w-4 h-4" />
                          {t.addUser}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto">
                      {isAddingUser && (
                        <div className="p-6 bg-[#f8faf9] border-b animate-in slide-in-from-top-4 duration-300">
                          <h4 className="text-sm font-bold text-[#1b7d3d] mb-4">New User</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                            <div className="w-full">
                              <Input 
                                value={generatedId} 
                                readOnly 
                                className="bg-white border-[#1b7d3d] text-[#1b7d3d] font-bold h-12 rounded-xl"
                              />
                            </div>
                            <div className="w-full">
                              <Input 
                                placeholder={t.name}
                                value={newUserName}
                                onChange={(e) => setNewUserName(e.target.value)}
                                className="bg-white border-[#e1e9e4] h-12 rounded-xl"
                              />
                            </div>
                            <div className="w-full">
                              <Input 
                                placeholder={t.email}
                                value={newUserEmail}
                                onChange={(e) => setNewUserEmail(e.target.value)}
                                className="bg-white border-[#e1e9e4] h-12 rounded-xl"
                              />
                            </div>
                            <div className="w-full">
                              <Input 
                                placeholder={t.loginCodeLabel}
                                value={newUserCode}
                                onChange={(e) => setNewUserCode(e.target.value)}
                                className="bg-white border-[#e1e9e4] h-12 rounded-xl"
                              />
                            </div>
                            <div className="flex items-center gap-2 lg:col-span-4 justify-end">
                              <Button 
                                onClick={handleSaveUser}
                                className="bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white h-12 px-6 rounded-xl flex items-center gap-2 font-bold"
                              >
                                <Save className="w-4 h-4" />
                                {t.update}
                              </Button>
                              <Button 
                                onClick={cancelAddingUser}
                                variant="outline"
                                className="h-12 w-12 p-0 rounded-xl border-gray-200"
                              >
                                <X className="w-5 h-5 text-gray-400" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                      <Table>
                        <TableHeader className="bg-[#f8faf9]">
                          <TableRow className="border-b">
                            <TableHead className="font-bold text-muted-foreground">{t.userId}</TableHead>
                            <TableHead className="font-bold text-muted-foreground">{t.name}</TableHead>
                            <TableHead className="font-bold text-muted-foreground">{t.email}</TableHead>
                            <TableHead className="font-bold text-muted-foreground">{t.code}</TableHead>
                            <TableHead className="font-bold text-muted-foreground">{t.status}</TableHead>
                            <TableHead className="font-bold text-right text-muted-foreground">{t.actions}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
                              <TableRow key={user.id} className="hover:bg-gray-50/50">
                                {editingUserId === user.id ? (
                                  <>
                                    <TableCell>
                                      <Input 
                                        value={editUserIdValue} 
                                        onChange={(e) => setEditUserIdValue(e.target.value)}
                                        className="bg-white border-[#e1e9e4] h-10 rounded-xl text-xs font-bold"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        value={editUserName} 
                                        onChange={(e) => setEditUserName(e.target.value)}
                                        className="bg-white border-[#e1e9e4] h-10 rounded-xl font-bold"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        value={editUserEmail} 
                                        onChange={(e) => setEditUserEmail(e.target.value)}
                                        className="bg-white border-[#e1e9e4] h-10 rounded-xl"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Input 
                                        value={editUserCode} 
                                        onChange={(e) => setEditUserCode(e.target.value)}
                                        className="bg-white border-[#e1e9e4] h-10 rounded-xl text-xs"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Switch 
                                        checked={editUserStatus === 'Active'} 
                                        onCheckedChange={(checked) => setEditUserStatus(checked ? 'Active' : 'Disabled')} 
                                      />
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          onClick={() => handleUpdateUser(user.id)}
                                          className="bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white h-10 w-10 p-0 rounded-xl"
                                        >
                                          <Save className="w-5 h-5" />
                                        </Button>
                                        <Button 
                                          onClick={cancelEditingUser}
                                          variant="outline"
                                          className="h-10 w-10 p-0 rounded-xl border-gray-200"
                                        >
                                          <X className="w-5 h-5 text-gray-400" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </>
                                ) : (
                                  <>
                                    <TableCell className="font-medium text-xs text-muted-foreground">{user.id}</TableCell>
                                    <TableCell className="font-bold">{user.name}</TableCell>
                                    <TableCell className="text-xs">{user.email}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground tracking-widest">{user.code}</TableCell>
                                    <TableCell>
                                      <Badge className={cn(
                                        "transition-colors",
                                        user.status === 'Active' ? 'bg-[#1b7d3d] hover:bg-[#1b7d3d]/90' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                      )}>
                                        {user.status === 'Active' ? t.active : t.disabled}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <div className="flex justify-end gap-2">
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          onClick={() => startEditingUser(user)}
                                          className="h-8 w-8 rounded-md border-gray-200"
                                        >
                                          <Pencil className="w-4 h-4 text-gray-600" />
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="icon" 
                                          onClick={() => deleteUser(user.id)}
                                          className="h-8 w-8 rounded-md border-red-100 bg-red-50 hover:bg-red-100"
                                        >
                                          <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                {userSearchTerm ? "No users found matching your search." : "No users registered yet."}
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="border-[#e1e9e4] shadow-sm rounded-2xl overflow-hidden bg-white">
                <CardHeader className="pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-[#1b7d3d]" />
                    <CardTitle className="text-xl font-bold">{t.manageCrops}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current Crops</Label>
                    <div className="flex flex-wrap gap-2">
                      {crops.map((crop) => (
                        <div key={crop.id} className="flex items-center gap-2 bg-[#f8faf9] border border-[#e1e9e4] pl-2 pr-1 py-1 rounded-full group hover:border-[#1b7d3d]/30 transition-colors">
                          <div className="w-6 h-6 flex items-center justify-center overflow-hidden">
                            {crop.isImage ? (
                              <img src={crop.icon} alt={crop.nameEn} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              <span className="text-sm">{crop.icon}</span>
                            )}
                          </div>
                          <span className="text-xs font-bold text-gray-700">
                            {crop.nameEn} {crop.nameBn ? `(${crop.nameBn})` : ''}
                          </span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteCrop(crop.id)}
                            className="h-6 w-6 p-0 rounded-full hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ))}
                      {showManyMore && (
                        <div className="flex items-center gap-2 bg-[#f8faf9] border border-[#e1e9e4] pl-3 pr-1 py-1 rounded-full text-xs font-bold text-muted-foreground group hover:border-[#1b7d3d]/30 transition-colors">
                          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                          Many More (আরও অনেক)
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={handleDeleteManyMore}
                            className="h-6 w-6 p-0 rounded-full hover:bg-red-50 hover:text-red-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-gray-100" />

                  <div className="space-y-6">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Add New Crop</Label>
                    
                    <Tabs value={cropAddMode} onValueChange={(v) => setCropAddMode(v as 'emoji' | 'photo')} className="w-full">
                      <TabsList className="bg-[#f0f9f1] p-1 rounded-xl h-11 w-fit mb-4">
                        <TabsTrigger value="emoji" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-[#1b7d3d] data-[state=active]:shadow-sm">
                          <Smile className="w-4 h-4 mr-2" />
                          Emoji
                        </TabsTrigger>
                        <TabsTrigger value="photo" className="rounded-lg px-6 data-[state=active]:bg-white data-[state=active]:text-[#1b7d3d] data-[state=active]:shadow-sm">
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Upload Photo
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="emoji" className="space-y-4 m-0">
                        <div className="flex justify-between items-end mb-1">
                          <Label className="text-sm font-bold text-gray-700">Choose Emoji</Label>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            Selected: <span className="text-xl bg-white p-1 rounded-md border">{selectedEmoji}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 p-3 bg-[#f8faf9] rounded-2xl border border-[#e1e9e4]">
                          {PRESET_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setSelectedEmoji(emoji)}
                              className={cn(
                                "h-10 w-10 flex items-center justify-center text-xl rounded-xl transition-all hover:scale-110",
                                selectedEmoji === emoji ? "bg-white shadow-md border-[#1b7d3d] border-2" : "hover:bg-white"
                              )}
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="photo" className="space-y-4 m-0">
                        <div className="flex items-center justify-between mb-1">
                          <Label className="text-sm font-bold text-gray-700">Upload Photo</Label>
                          {uploadedCropPhoto && (
                            <Button variant="ghost" size="sm" onClick={() => setUploadedCropPhoto(null)} className="h-6 text-[10px] text-red-500">Remove</Button>
                          )}
                        </div>
                        <div 
                          onClick={() => cropPhotoInputRef.current?.click()}
                          className={cn(
                            "h-32 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
                            uploadedCropPhoto ? "border-[#1b7d3d] bg-[#1b7d3d]/5" : "border-[#e1e9e4] hover:bg-[#f8faf9] hover:border-[#1b7d3d]/30"
                          )}
                        >
                          {uploadedCropPhoto ? (
                            <img src={uploadedCropPhoto} alt="Selected crop" className="h-20 w-20 object-cover rounded-xl" />
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                              <span className="text-xs text-muted-foreground">Click to upload photo</span>
                            </>
                          )}
                          <input 
                            ref={cropPhotoInputRef}
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleCropPhotoUpload} 
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Name (English) *</Label>
                        <Input 
                          placeholder="e.g. Onion"
                          value={newCropNameEn}
                          onChange={(e) => setNewCropNameEn(e.target.value)}
                          className="bg-[#f8faf9] border-[#e1e9e4] h-12 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-gray-700">Name (Bengali)</Label>
                        <Input 
                          placeholder="e.g. পেঁয়াজ"
                          value={newCropNameBn}
                          onChange={(e) => setNewCropNameBn(e.target.value)}
                          className="bg-[#f8faf9] border-[#e1e9e4] h-12 rounded-xl"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={handleSaveCrop}
                      className="w-full bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold h-14 rounded-2xl flex gap-2 text-lg shadow-md"
                    >
                      <Plus className="w-5 h-5" />
                      Add Crop
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Visitor Stats Card */}
              <Card className="border-[#e1e9e4] shadow-sm rounded-2xl bg-[#f8faf9]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1b7d3d]">
                    <Eye className="w-4 h-4" />
                    {t.visitorStats}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-[#e1e9e4] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.totalViews}</p>
                      <p className="text-2xl font-bold text-[#1b7d3d]">{statsData?.visitorCount || 0}</p>
                    </div>
                    <LayoutDashboard className="w-8 h-8 text-[#1b7d3d]/20" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-[#e1e9e4]">
                    <div>
                      <h4 className="text-sm font-bold">{t.viewerOption}</h4>
                      <p className="text-[10px] text-muted-foreground">{t.showVisitorCount}</p>
                    </div>
                    <Switch 
                      checked={statsData?.showVisitorCount || false} 
                      onCheckedChange={toggleShowVisitorCount} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Logo Management Card - Free Storage Strategy */}
              <Card className="border-[#e1e9e4] shadow-sm rounded-2xl bg-[#f8faf9]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1b7d3d]">
                    <ImageIcon className="w-4 h-4" />
                    {t.appLogo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-xl border border-[#e1e9e4]">
                    <div className="w-20 h-20 rounded-xl border flex items-center justify-center overflow-hidden bg-[#f8faf9]">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                      ) : (
                        <ShieldPlus className="w-10 h-10 text-[#1b7d3d]" />
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-gray-800">{logoUrl ? t.appLogo : t.usingDefaultIcon}</p>
                      <p className="text-[10px] text-muted-foreground">{t.shownInAppHeader}</p>
                    </div>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                    />
                    <Button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold rounded-lg h-9 text-xs"
                    >
                      <Upload className="w-3.5 h-3.5 mr-2" />
                      {t.uploadLogo}
                    </Button>
                    {logoUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setLogoUrl(null)}
                        className="text-red-500 hover:text-red-600 h-8 text-[10px]"
                      >
                        Reset to Default
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e1e9e4] shadow-sm rounded-2xl bg-[#f8faf9]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1b7d3d]">
                    <Mail className="w-4 h-4" />
                    {t.manageContactInfo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="space-y-4 p-4 bg-white rounded-xl border border-[#e1e9e4]">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.oldEmail}</Label>
                      <Input 
                        placeholder="Current admin email"
                        value={oldEmailInput}
                        onChange={(e) => setOldEmailInput(e.target.value)}
                        className="bg-white border-[#e1e9e4] rounded-lg"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.newEmail}</Label>
                      <Input 
                        placeholder="New admin email"
                        value={newEmailInput}
                        onChange={(e) => setNewEmailInput(e.target.value)}
                        className="bg-white border-[#e1e9e4] rounded-lg"
                      />
                    </div>
                    <Button onClick={handleUpdateAdminEmail} className="w-full bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold rounded-lg text-xs h-9">
                      {t.update} Email
                    </Button>
                  </div>

                  <div className="space-y-4 p-4 bg-white rounded-xl border border-[#e1e9e4]">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.adminPhone}</Label>
                      <Input 
                        placeholder="Admin phone number"
                        value={adminPhone}
                        onChange={(e) => setAdminPhone(e.target.value)}
                        className="bg-white border-[#e1e9e4] rounded-lg"
                      />
                    </div>
                    <Button onClick={handleUpdateAdminPhone} className="w-full bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold rounded-lg text-xs h-9">
                      {t.update} Phone
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e1e9e4] shadow-sm rounded-2xl bg-[#f8faf9]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1b7d3d]">
                    <Lock className="w-4 h-4" />
                    {t.securityMode}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold">{t.loginRequired}</h4>
                      <p className="text-[10px] text-muted-foreground">{t.anyoneCanAccess}</p>
                    </div>
                    <span className="relative flex items-center">
                      <Switch checked={securityMode} onCheckedChange={toggleSecurityMode} />
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#e1e9e4] shadow-sm rounded-2xl bg-[#f8faf9]">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-[#1b7d3d]">
                    <Key className="w-4 h-4" />
                    {t.changeLoginCode}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.newLoginCode}</Label>
                    <Input 
                      type="password"
                      placeholder={t.newCode}
                      value={newAdminCode}
                      onChange={(e) => setNewAdminCode(e.target.value)}
                      className="bg-white border-[#e1e9e4] rounded-lg"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{t.confirmNewCode}</Label>
                    <Input 
                      type="password"
                      placeholder={t.confirmCode}
                      value={confirmAdminCode}
                      onChange={(e) => setConfirmAdminCode(e.target.value)}
                      className="bg-white border-[#e1e9e4] rounded-lg"
                    />
                  </div>
                  <Button onClick={handleUpdateCode} className="w-full bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold rounded-lg">
                    {t.update}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="pt-8">
            <Link href="/" className="flex items-center gap-2 text-[#1b7d3d] font-bold hover:underline">
              <ArrowLeft className="w-4 h-4" />
              {t.backToHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f1f8f3] flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-4 mb-10">
        <div className="bg-[#1b7d3d] p-3 rounded-xl shadow-lg flex items-center justify-center overflow-hidden w-16 h-16">
          {logoUrl ? (
            <img src={logoUrl} alt="App Logo" className="w-full h-full object-cover" />
          ) : (
            <ShieldPlus className="w-10 h-10 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#1b7d3d] leading-none">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t.appDescription}</p>
        </div>
      </div>

      <Card className="w-full max-w-md border-[#e1e9e4] rounded-[2rem] shadow-xl bg-white overflow-hidden">
        <CardContent className="p-10 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">{t.adminLoginTitle}</h2>
            <p className="text-sm text-muted-foreground">{t.adminLoginSubtitle}</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">{t.userIdLabel}</Label>
              <Input 
                placeholder={t.userIdPlaceholder}
                className="h-12 bg-[#f8faf9] border-[#e1e9e4] rounded-xl"
                value={userIdInput}
                onChange={(e) => setUserIdInput(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-gray-700">{t.loginCodeLabel}</Label>
              <Input 
                type="password"
                placeholder={t.loginCodePlaceholder}
                className="h-12 bg-[#f8faf9] border-[#e1e9e4] rounded-xl"
                value={loginCodeInput}
                onChange={(e) => setLoginCodeInput(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-14 bg-[#1b7d3d] hover:bg-[#1b7d3d]/90 text-white font-bold rounded-xl shadow-md text-lg flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              {t.loginButton}
            </Button>
          </form>

          <div className="pt-2 text-center">
            <Link href="/" className="text-[#1b7d3d] font-bold text-sm hover:underline inline-flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              {t.backToHome}
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
