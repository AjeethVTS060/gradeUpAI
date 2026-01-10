import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../hooks/use-auth";
import Navigation from "../components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "../hooks/use-toast";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Send,
  ArrowLeft,
  GraduationCap,
  FileText,
  Bell,
  Activity
} from "lucide-react";
import { Link } from "wouter";

const studentFormSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  grade: z.number().min(9).max(12),
  studentId: z.string().min(1, "Student ID is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  medicalInfo: z.string().optional(),
});

const parentFormSchema = z.object({
  parentType: z.enum(["father", "mother", "guardian"]),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(1, "Phone number is required"),
  workPhone: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContact: z.boolean().default(false),
  preferredContactMethod: z.enum(["email", "phone", "sms"]).default("email"),
});

interface StudentWithProfile {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  grade: number;
  profileImage?: string;
  studentProfile?: {
    id: number;
    studentId: string;
    dateOfBirth?: string;
    address?: string;
    phone?: string;
    status: string;
    enrollmentDate: string;
  };
  parentContacts?: Array<{
    id: number;
    parentType: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact: boolean;
  }>;
  attendanceStats?: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateCount: number;
    attendanceRate: number;
  };
}

export default function StudentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentWithProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [isAddingParent, setIsAddingParent] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const currentRole = user?.role || "teacher";

  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["/api/students"],
  });

  // Fetch attendance data
  const { data: attendanceData = [] } = useQuery({
    queryKey: ["/api/students/attendance"],
  });

  // Create student mutation
  const createStudentMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studentFormSchema>) => {
      const response = await apiRequest("/api/students", "POST", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsAddingStudent(false);
      toast({ title: "Student added successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to add student", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Add parent contact mutation
  const addParentMutation = useMutation({
    mutationFn: async (data: { studentId: number; parentData: z.infer<typeof parentFormSchema> }) => {
      const response = await apiRequest(`/api/students/${data.studentId}/parents`, "POST", data.parentData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students"] });
      setIsAddingParent(false);
      toast({ title: "Parent contact added successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to add parent contact", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  // Send notification mutation
  const sendNotificationMutation = useMutation({
    mutationFn: async (data: { 
      studentIds: number[]; 
      type: string; 
      title: string; 
      message: string;
      sendEmail: boolean;
    }) => {
      const response = await apiRequest("/api/students/notifications", "POST", data);
      return response;
    },
    onSuccess: () => {
      toast({ title: "Notifications sent successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to send notifications", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const studentForm = useForm<z.infer<typeof studentFormSchema>>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      grade: 9,
    },
  });

  const parentForm = useForm<z.infer<typeof parentFormSchema>>({
    resolver: zodResolver(parentFormSchema),
    defaultValues: {
      parentType: "father",
      emergencyContact: false,
      preferredContactMethod: "email",
    },
  });

  const filteredStudents = students.filter((student: StudentWithProfile) => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentProfile?.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGrade = selectedGrade === "all" || student.grade?.toString() === selectedGrade;
    const matchesStatus = selectedStatus === "all" || student.studentProfile?.status === selectedStatus;
    
    return matchesSearch && matchesGrade && matchesStatus;
  });

  const getAttendanceStatus = (studentId: number) => {
    const today = new Date().toDateString();
    const todayAttendance = attendanceData.find((att: any) => 
      att.studentId === studentId && 
      new Date(att.date).toDateString() === today
    );
    
    if (!todayAttendance) return { status: "not-marked", color: "bg-gray-500", text: "Not Marked" };
    
    switch (todayAttendance.status) {
      case "present": return { status: "present", color: "bg-green-500", text: "Present" };
      case "absent": return { status: "absent", color: "bg-red-500", text: "Absent" };
      case "late": return { status: "late", color: "bg-yellow-500", text: "Late" };
      case "excused": return { status: "excused", color: "bg-blue-500", text: "Excused" };
      default: return { status: "not-marked", color: "bg-gray-500", text: "Not Marked" };
    }
  };

  const onSubmitStudent = (data: z.infer<typeof studentFormSchema>) => {
    createStudentMutation.mutate(data);
  };

  const onSubmitParent = (data: z.infer<typeof parentFormSchema>) => {
    if (!selectedStudent?.studentProfile?.id) return;
    
    addParentMutation.mutate({
      studentId: selectedStudent.studentProfile.id,
      parentData: data,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentRole={currentRole} onRoleChange={() => {}} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back to Dashboard */}
        <div className="mb-4">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Management</h1>
            <p className="text-gray-600 mt-2">Manage student profiles, attendance, and parent communications</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Dialog open={isAddingStudent} onOpenChange={setIsAddingStudent}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Create a new student profile with basic information
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...studentForm}>
                  <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={studentForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={studentForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={studentForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={studentForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={studentForm.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value?.toString()}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="9">Grade 9</SelectItem>
                                <SelectItem value="10">Grade 10</SelectItem>
                                <SelectItem value="11">Grade 11</SelectItem>
                                <SelectItem value="12">Grade 12</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={studentForm.control}
                        name="studentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student ID</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={studentForm.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={studentForm.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={studentForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={studentForm.control}
                        name="emergencyContact"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Emergency Contact</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={studentForm.control}
                      name="medicalInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical Information</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder="Any medical conditions or allergies..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddingStudent(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createStudentMutation.isPending}>
                        {createStudentMutation.isPending ? "Adding..." : "Add Student"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search students by name, email, or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  <SelectItem value="9">Grade 9</SelectItem>
                  <SelectItem value="10">Grade 10</SelectItem>
                  <SelectItem value="11">Grade 11</SelectItem>
                  <SelectItem value="12">Grade 12</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students ({filteredStudents.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
              <div className="text-center py-8">Loading students...</div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No students found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Attendance Today</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student: StudentWithProfile) => {
                    const attendanceStatus = getAttendanceStatus(student.studentProfile?.id || 0);
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={student.profileImage} />
                              <AvatarFallback>
                                {student.firstName[0]}{student.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-500">{student.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {student.studentProfile?.studentId || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell>Grade {student.grade}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {student.parentContacts?.slice(0, 1).map((parent, index) => (
                              <div key={index} className="text-sm">
                                <div className="font-medium">{parent.firstName} {parent.lastName}</div>
                                <div className="text-gray-500">{parent.email}</div>
                              </div>
                            ))}
                            {(student.parentContacts?.length || 0) > 1 && (
                              <div className="text-xs text-gray-400">
                                +{(student.parentContacts?.length || 0) - 1} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${attendanceStatus.color} text-white`}>
                            {attendanceStatus.text}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={student.studentProfile?.status === "active" ? "default" : "secondary"}
                          >
                            {student.studentProfile?.status || "active"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedStudent(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Student Details Modal */}
        {selectedStudent && (
          <Dialog open={!!selectedStudent} onOpenChange={() => setSelectedStudent(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedStudent.profileImage} />
                    <AvatarFallback>
                      {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-lg">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedStudent.studentProfile?.studentId} • Grade {selectedStudent.grade}
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="parents">Parent Contacts</TabsTrigger>
                  <TabsTrigger value="attendance">Attendance</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold">Personal Information</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Email:</strong> {selectedStudent.email}</div>
                        <div><strong>Date of Birth:</strong> {selectedStudent.studentProfile?.dateOfBirth ? format(new Date(selectedStudent.studentProfile.dateOfBirth), "PPP") : "Not provided"}</div>
                        <div><strong>Phone:</strong> {selectedStudent.studentProfile?.phone || "Not provided"}</div>
                        <div><strong>Address:</strong> {selectedStudent.studentProfile?.address || "Not provided"}</div>
                        <div><strong>Enrollment Date:</strong> {selectedStudent.studentProfile?.enrollmentDate ? format(new Date(selectedStudent.studentProfile.enrollmentDate), "PPP") : "Not available"}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-semibold">Attendance Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div><strong>Total Days:</strong> {selectedStudent.attendanceStats?.totalDays || 0}</div>
                        <div><strong>Present:</strong> {selectedStudent.attendanceStats?.presentDays || 0}</div>
                        <div><strong>Absent:</strong> {selectedStudent.attendanceStats?.absentDays || 0}</div>
                        <div><strong>Late:</strong> {selectedStudent.attendanceStats?.lateCount || 0}</div>
                        <div><strong>Attendance Rate:</strong> {selectedStudent.attendanceStats?.attendanceRate || 0}%</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="parents" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Parent Contacts</h3>
                    <Dialog open={isAddingParent} onOpenChange={setIsAddingParent}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Parent
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add Parent Contact</DialogTitle>
                        </DialogHeader>
                        
                        <Form {...parentForm}>
                          <form onSubmit={parentForm.handleSubmit(onSubmitParent)} className="space-y-4">
                            <FormField
                              control={parentForm.control}
                              name="parentType"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="father">Father</SelectItem>
                                      <SelectItem value="mother">Mother</SelectItem>
                                      <SelectItem value="guardian">Guardian</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={parentForm.control}
                                name="firstName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>First Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={parentForm.control}
                                name="lastName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Last Name</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={parentForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={parentForm.control}
                                name="phone"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Phone</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="flex justify-end space-x-2">
                              <Button type="button" variant="outline" onClick={() => setIsAddingParent(false)}>
                                Cancel
                              </Button>
                              <Button type="submit" disabled={addParentMutation.isPending}>
                                {addParentMutation.isPending ? "Adding..." : "Add Parent"}
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedStudent.parentContacts?.map((parent, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="font-medium">
                                {parent.firstName} {parent.lastName}
                                <Badge variant="outline" className="ml-2">
                                  {parent.parentType}
                                </Badge>
                                {parent.emergencyContact && (
                                  <Badge variant="destructive" className="ml-2">
                                    Emergency Contact
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                <div className="flex items-center gap-4">
                                  <span className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    {parent.email}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {parent.phone}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button size="sm" variant="outline">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Phone className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    
                    {!selectedStudent.parentContacts?.length && (
                      <div className="text-center py-8 text-gray-500">
                        No parent contacts added yet
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="attendance" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Attendance Records</h3>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {attendanceData
                      .filter((att: any) => att.studentId === selectedStudent.studentProfile?.id)
                      .slice(0, 10)
                      .map((attendance: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium">
                              {format(new Date(attendance.date), "PPP")}
                            </div>
                            {attendance.loginTime && (
                              <div className="text-xs text-gray-500">
                                Login: {format(new Date(attendance.loginTime), "HH:mm")}
                              </div>
                            )}
                          </div>
                          <Badge className={`${getAttendanceStatus(attendance.studentId).color} text-white`}>
                            {attendance.status}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Send Notification</h3>
                  </div>
                  
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Type</label>
                          <Select defaultValue="general">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="general">General</SelectItem>
                              <SelectItem value="attendance">Attendance</SelectItem>
                              <SelectItem value="grades">Grades</SelectItem>
                              <SelectItem value="behavior">Behavior</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium">Recipients</label>
                          <Select defaultValue="parents">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="parents">All Parents</SelectItem>
                              <SelectItem value="emergency">Emergency Contacts Only</SelectItem>
                              <SelectItem value="student">Student Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Title</label>
                        <Input placeholder="Notification title..." />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Message</label>
                        <Textarea 
                          placeholder="Type your message here..."
                          rows={4}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="send-email" defaultChecked />
                          <label htmlFor="send-email" className="text-sm">Send via email</label>
                        </div>
                        
                        <Button>
                          <Send className="h-4 w-4 mr-2" />
                          Send Notification
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}