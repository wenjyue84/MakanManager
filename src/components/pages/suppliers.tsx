"use client";

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Building2,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  User,
  Star,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  X,
  CheckCircle,
  XCircle,
  Calendar,
  Truck,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { currentUser } from '../../lib/data';
import { staffMembers } from '../../lib/staff-data';
import { 
  suppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierById,
  getSuppliersByCategory,
  getActiveSuppliers,
  getCategoryColor,
  getCategoryDisplayName,
  formatDateTime,
  formatPhoneNumber,
  type Supplier 
} from '../../lib/operations-data';
import { toast } from "sonner@2.0.3";

export function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Form state
  const [formData, setFormData] = useState({
    companyName: '',
    displayName: '',
    category: 'vegetables' as Supplier['category'],
    primaryProducts: [] as string[],
    contactNumber: '',
    alternateNumber: '',
    email: '',
    address: '',
    picName: '',
    picPosition: '',
    picContactNumber: '',
    bankName: '',
    bankAccountNumber: '',
    bankAccountName: '',
    paymentTerms: '',
    minimumOrder: '',
    deliveryDays: [] as string[],
    rating: 5,
    isActive: true,
    description: '',
    notes: ''
  });

  const [productInput, setProductInput] = useState('');

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isManagement = currentUser.roles.some(role => 
    ['owner', 'manager', 'head-of-kitchen', 'front-desk-manager'].includes(role)
  );

  // Filter suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      if (searchQuery && !supplier.companyName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !supplier.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !supplier.picName.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (selectedCategory !== 'all' && supplier.category !== selectedCategory) return false;
      if (selectedStatus === 'active' && !supplier.isActive) return false;
      if (selectedStatus === 'inactive' && supplier.isActive) return false;
      return true;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  // Get categories
  const categories = Array.from(new Set(suppliers.map(s => s.category)));

  const getUserById = (id: string) => {
    return staffMembers.find(member => member.id === id);
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      displayName: '',
      category: 'vegetables',
      primaryProducts: [],
      contactNumber: '',
      alternateNumber: '',
      email: '',
      address: '',
      picName: '',
      picPosition: '',
      picContactNumber: '',
      bankName: '',
      bankAccountNumber: '',
      bankAccountName: '',
      paymentTerms: '',
      minimumOrder: '',
      deliveryDays: [],
      rating: 5,
      isActive: true,
      description: '',
      notes: ''
    });
    setProductInput('');
  };

  const handleCreateSupplier = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      companyName: supplier.companyName,
      displayName: supplier.displayName || '',
      category: supplier.category,
      primaryProducts: [...supplier.primaryProducts],
      contactNumber: supplier.contactNumber,
      alternateNumber: supplier.alternateNumber || '',
      email: supplier.email || '',
      address: supplier.address || '',
      picName: supplier.picName,
      picPosition: supplier.picPosition || '',
      picContactNumber: supplier.picContactNumber || '',
      bankName: supplier.bankName,
      bankAccountNumber: supplier.bankAccountNumber,
      bankAccountName: supplier.bankAccountName || '',
      paymentTerms: supplier.paymentTerms || '',
      minimumOrder: supplier.minimumOrder || '',
      deliveryDays: supplier.deliveryDays || [],
      rating: supplier.rating || 5,
      isActive: supplier.isActive,
      description: supplier.description || '',
      notes: supplier.notes || ''
    });
    setIsEditOpen(true);
  };

  const handleSaveSupplier = () => {
    if (!formData.companyName || !formData.picName || !formData.contactNumber || 
        !formData.bankName || !formData.bankAccountNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (isEditOpen && selectedSupplier) {
      const updated = updateSupplier(selectedSupplier.id, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      if (updated) {
        toast.success(`Supplier "${formData.companyName}" updated successfully`);
        setIsEditOpen(false);
        setSelectedSupplier(null);
      } else {
        toast.error('Failed to update supplier');
      }
    } else {
      const newSupplier = addSupplier({
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        addedBy: currentUser.id
      });
      
      toast.success(`Supplier "${formData.companyName}" added successfully`);
      setIsCreateOpen(false);
    }
    
    resetForm();
  };

  const handleDeleteSupplier = () => {
    if (!selectedSupplier) return;
    
    const success = deleteSupplier(selectedSupplier.id);
    if (success) {
      toast.success(`Supplier "${selectedSupplier.companyName}" deleted successfully`);
      setIsDeleteDialogOpen(false);
      setIsDetailOpen(false);
      setSelectedSupplier(null);
    } else {
      toast.error('Failed to delete supplier');
    }
  };

  const handleAddProduct = () => {
    if (productInput.trim() && !formData.primaryProducts.includes(productInput.trim())) {
      setFormData(prev => ({
        ...prev,
        primaryProducts: [...prev.primaryProducts, productInput.trim()]
      }));
      setProductInput('');
    }
  };

  const handleRemoveProduct = (product: string) => {
    setFormData(prev => ({
      ...prev,
      primaryProducts: prev.primaryProducts.filter(p => p !== product)
    }));
  };

  const handleToggleDeliveryDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      deliveryDays: prev.deliveryDays.includes(day) 
        ? prev.deliveryDays.filter(d => d !== day)
        : [...prev.deliveryDays, day]
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedStatus('all');
  };

  const renderStarRating = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`size-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Mobile Card Component
  const SupplierCard = ({ supplier }: { supplier: Supplier }) => {
    const addedBy = getUserById(supplier.addedBy);
    
    return (
      <Card className="cursor-pointer hover:bg-accent/50" onClick={() => {
        setSelectedSupplier(supplier);
        setIsDetailOpen(true);
      }}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium">{supplier.displayName || supplier.companyName}</h4>
                <div className="text-sm text-muted-foreground">{supplier.companyName}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={getCategoryColor(supplier.category)} className="text-xs">
                    {getCategoryDisplayName(supplier.category)}
                  </Badge>
                  {supplier.isActive ? (
                    <Badge variant="success" className="text-xs">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">Inactive</Badge>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1">
                  {renderStarRating(supplier.rating || 0)}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {supplier.primaryProducts.length} products
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <User className="size-3 text-muted-foreground" />
                <span>{supplier.picName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-3 text-muted-foreground" />
                <span>{formatPhoneNumber(supplier.contactNumber)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="size-3 text-muted-foreground" />
                <span>{supplier.bankName}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1">
              {supplier.primaryProducts.slice(0, 3).map(product => (
                <Badge key={product} variant="outline" className="text-xs">
                  {product}
                </Badge>
              ))}
              {supplier.primaryProducts.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{supplier.primaryProducts.length - 3} more
                </Badge>
              )}
            </div>

            {isManagement && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-xs text-muted-foreground">
                  Added by {addedBy?.name}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    handleEditSupplier(supplier);
                  }}>
                    <Edit className="size-3" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSupplier(supplier);
                    setIsDeleteDialogOpen(true);
                  }}>
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Desktop Table Row Component
  const SupplierTableRow = ({ supplier }: { supplier: Supplier }) => {
    const addedBy = getUserById(supplier.addedBy);
    
    return (
      <TableRow className="cursor-pointer hover:bg-accent/50" onClick={() => {
        setSelectedSupplier(supplier);
        setIsDetailOpen(true);
      }}>
        <TableCell>
          <div>
            <div className="font-medium">{supplier.displayName || supplier.companyName}</div>
            <div className="text-sm text-muted-foreground">{supplier.companyName}</div>
          </div>
        </TableCell>
        <TableCell>
          <Badge variant={getCategoryColor(supplier.category)}>
            {getCategoryDisplayName(supplier.category)}
          </Badge>
        </TableCell>
        <TableCell>
          <div>
            <div className="font-medium">{supplier.picName}</div>
            <div className="text-sm text-muted-foreground">{supplier.picPosition}</div>
          </div>
        </TableCell>
        <TableCell>
          <div>
            <div>{formatPhoneNumber(supplier.contactNumber)}</div>
            {supplier.alternateNumber && (
              <div className="text-sm text-muted-foreground">{formatPhoneNumber(supplier.alternateNumber)}</div>
            )}
          </div>
        </TableCell>
        <TableCell>
          <div className="text-sm">{supplier.email || '—'}</div>
        </TableCell>
        <TableCell>
          <div>
            <div>{supplier.bankName}</div>
            <div className="text-sm text-muted-foreground">{supplier.bankAccountNumber}</div>
          </div>
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            {renderStarRating(supplier.rating || 0)}
          </div>
        </TableCell>
        <TableCell>
          {supplier.isActive ? (
            <Badge variant="success" className="flex items-center gap-1">
              <CheckCircle className="size-3" />
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <XCircle className="size-3" />
              Inactive
            </Badge>
          )}
        </TableCell>
        <TableCell>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="outline">
              <Eye className="size-3 mr-1" />
              View
            </Button>
            {isManagement && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" onClick={(e) => e.stopPropagation()}>
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleEditSupplier(supplier);
                  }}>
                    Edit Supplier
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSupplier(supplier);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="text-destructive"
                  >
                    Delete Supplier
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Suppliers</h1>
              <p className="text-muted-foreground">Manage supplier relationships and contact information</p>
            </div>
            
            {isManagement && (
              <Button onClick={handleCreateSupplier} className="flex items-center gap-2">
                <Plus className="size-4" />
                Add Supplier
              </Button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search suppliers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {getCategoryDisplayName(category)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {(searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all') && (
                  <Button onClick={clearFilters} variant="outline" size="sm">
                    <X className="size-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Suppliers List */}
        <div>
          {filteredSuppliers.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="size-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-muted-foreground">
                No suppliers found. {isManagement ? 'Add your first supplier!' : 'Contact management to add suppliers.'}
              </div>
            </div>
          ) : (
            <>
              {isMobile ? (
                <div className="grid gap-4">
                  {filteredSuppliers.map((supplier) => (
                    <SupplierCard key={supplier.id} supplier={supplier} />
                  ))}
                </div>
              ) : (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Bank Details</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSuppliers.map((supplier) => (
                        <SupplierTableRow key={supplier.id} supplier={supplier} />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Create/Edit Supplier Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setIsEditOpen(false);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
            <DialogDescription>
              {isEditOpen ? 'Update supplier information' : 'Enter supplier details and contact information'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact & Banking</TabsTrigger>
              <TabsTrigger value="business">Business Details</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    value={formData.companyName}
                    onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                    placeholder="e.g., The Vegi Depot by Vegibest Grocery"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Display Name</Label>
                  <Input
                    value={formData.displayName}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                    placeholder="e.g., Vegi Depot (short name)"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, category: value as Supplier['category'] }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vegetables">Vegetables</SelectItem>
                      <SelectItem value="seafood">Seafood</SelectItem>
                      <SelectItem value="beverages">Beverages</SelectItem>
                      <SelectItem value="frozen-foods">Frozen Foods</SelectItem>
                      <SelectItem value="equipment">Equipment</SelectItem>
                      <SelectItem value="grocery">Grocery</SelectItem>
                      <SelectItem value="dairy">Dairy</SelectItem>
                      <SelectItem value="bakery">Bakery</SelectItem>
                      <SelectItem value="condiments">Condiments</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rating</Label>
                  <Select value={formData.rating.toString()} onValueChange={(value) => 
                    setFormData(prev => ({ ...prev, rating: parseInt(value) }))
                  }>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Stars - Excellent</SelectItem>
                      <SelectItem value="4">4 Stars - Good</SelectItem>
                      <SelectItem value="3">3 Stars - Average</SelectItem>
                      <SelectItem value="2">2 Stars - Poor</SelectItem>
                      <SelectItem value="1">1 Star - Very Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Primary Products</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={productInput}
                    onChange={(e) => setProductInput(e.target.value)}
                    placeholder="Add product"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                  />
                  <Button type="button" onClick={handleAddProduct}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.primaryProducts.map(product => (
                    <Badge key={product} variant="secondary" className="flex items-center gap-1">
                      {product}
                      <X className="size-3 cursor-pointer" onClick={() => handleRemoveProduct(product)} />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the supplier and their services..."
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Active Supplier</Label>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Number *</Label>
                  <Input
                    value={formData.contactNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                    placeholder="+60123456789"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Alternate Number</Label>
                  <Input
                    value={formData.alternateNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, alternateNumber: e.target.value }))}
                    placeholder="+60198765432"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="orders@supplier.com"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Full address including city and state"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Person in Charge (PIC) *</Label>
                  <Input
                    value={formData.picName}
                    onChange={(e) => setFormData(prev => ({ ...prev, picName: e.target.value }))}
                    placeholder="Contact person name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>PIC Position</Label>
                  <Input
                    value={formData.picPosition}
                    onChange={(e) => setFormData(prev => ({ ...prev, picPosition: e.target.value }))}
                    placeholder="e.g., Sales Manager, Owner"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>PIC Contact Number</Label>
                <Input
                  value={formData.picContactNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, picContactNumber: e.target.value }))}
                  placeholder="+60123456789"
                  className="mt-1"
                />
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Bank Name *</Label>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="e.g., Public Bank, Maybank"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Bank Account Number *</Label>
                  <Input
                    value={formData.bankAccountNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                    placeholder="Account number"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Bank Account Name</Label>
                <Input
                  value={formData.bankAccountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankAccountName: e.target.value }))}
                  placeholder="Account holder name"
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="business" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Terms</Label>
                  <Input
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    placeholder="e.g., Net 30 days, Cash on delivery"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Minimum Order</Label>
                  <Input
                    value={formData.minimumOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumOrder: e.target.value }))}
                    placeholder="e.g., RM 100"
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Delivery Days</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {daysOfWeek.map(day => (
                    <div key={day} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.deliveryDays.includes(day)}
                        onChange={() => handleToggleDeliveryDay(day)}
                      />
                      <Label className="text-sm">{day.slice(0, 3)}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Internal notes about this supplier..."
                  className="mt-1"
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCreateOpen(false);
              setIsEditOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveSupplier}>
              {isEditOpen ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Supplier Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSupplier && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedSupplier.displayName || selectedSupplier.companyName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={getCategoryColor(selectedSupplier.category)}>
                      {getCategoryDisplayName(selectedSupplier.category)}
                    </Badge>
                    {selectedSupplier.isActive ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </DialogTitle>
                <DialogDescription>
                  {selectedSupplier.companyName}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Contact Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="size-4 text-muted-foreground" />
                          <span>{selectedSupplier.picName}</span>
                          {selectedSupplier.picPosition && (
                            <span className="text-muted-foreground">({selectedSupplier.picPosition})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="size-4 text-muted-foreground" />
                          <span>{formatPhoneNumber(selectedSupplier.contactNumber)}</span>
                        </div>
                        {selectedSupplier.alternateNumber && (
                          <div className="flex items-center gap-2">
                            <Phone className="size-4 text-muted-foreground" />
                            <span>{formatPhoneNumber(selectedSupplier.alternateNumber)} (Alt)</span>
                          </div>
                        )}
                        {selectedSupplier.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="size-4 text-muted-foreground" />
                            <span>{selectedSupplier.email}</span>
                          </div>
                        )}
                        {selectedSupplier.address && (
                          <div className="flex items-start gap-2">
                            <MapPin className="size-4 text-muted-foreground mt-0.5" />
                            <span>{selectedSupplier.address}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Banking Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-4 text-muted-foreground" />
                          <span>{selectedSupplier.bankName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4" />
                          <span className="font-mono">{selectedSupplier.bankAccountNumber}</span>
                        </div>
                        {selectedSupplier.bankAccountName && (
                          <div className="flex items-center gap-2">
                            <span className="w-4" />
                            <span>{selectedSupplier.bankAccountName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Business Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Rating:</span>
                          <div className="flex items-center gap-1">
                            {renderStarRating(selectedSupplier.rating || 0)}
                          </div>
                        </div>
                        {selectedSupplier.paymentTerms && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Payment Terms:</span>
                            <span>{selectedSupplier.paymentTerms}</span>
                          </div>
                        )}
                        {selectedSupplier.minimumOrder && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Minimum Order:</span>
                            <span>{selectedSupplier.minimumOrder}</span>
                          </div>
                        )}
                        {selectedSupplier.deliveryDays && selectedSupplier.deliveryDays.length > 0 && (
                          <div className="flex items-start gap-2">
                            <Truck className="size-4 text-muted-foreground mt-0.5" />
                            <div>
                              <span className="font-medium">Delivery Days:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {selectedSupplier.deliveryDays.map(day => (
                                  <Badge key={day} variant="outline" className="text-xs">{day}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        {selectedSupplier.lastOrderDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span className="font-medium">Last Order:</span>
                            <span>{new Date(selectedSupplier.lastOrderDate).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Primary Products</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSupplier.primaryProducts.map(product => (
                          <Badge key={product} variant="outline" className="flex items-center gap-1">
                            <Package className="size-3" />
                            {product}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedSupplier.description && (
                  <div>
                    <h4 className="font-medium mb-2">Description</h4>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.description}</p>
                  </div>
                )}

                {selectedSupplier.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Internal Notes</h4>
                    <p className="text-sm text-muted-foreground">{selectedSupplier.notes}</p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground border-t pt-4">
                  <div>Added by {getUserById(selectedSupplier.addedBy)?.name} on {formatDateTime(selectedSupplier.createdAt)}</div>
                  {selectedSupplier.updatedAt !== selectedSupplier.createdAt && (
                    <div>Last updated on {formatDateTime(selectedSupplier.updatedAt)}</div>
                  )}
                </div>
              </div>

              <DialogFooter>
                {isManagement && (
                  <>
                    <Button 
                      variant="destructive" 
                      onClick={() => {
                        setIsDetailOpen(false);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="size-4 mr-2" />
                      Delete
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsDetailOpen(false);
                        handleEditSupplier(selectedSupplier);
                      }}
                    >
                      <Edit className="size-4 mr-2" />
                      Edit
                    </Button>
                  </>
                )}
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Supplier</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSupplier?.companyName}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSupplier}>
              Delete Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}