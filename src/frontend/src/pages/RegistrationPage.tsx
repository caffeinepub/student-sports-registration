import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  GraduationCap,
  Loader2,
  Phone,
  Shield,
  Shirt,
  Trophy,
  User,
  Utensils,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import { useSubmitRegistration } from "../hooks/useQueries";

interface Props {
  onSuccess: (id: bigint) => void;
  onAdminClick: () => void;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const AGE_GROUPS = ["U14", "U17", "U19"];
const CLASSES = [
  "Class 1",
  "Class 2",
  "Class 3",
  "Class 4",
  "Class 5",
  "Class 6",
  "Class 7",
  "Class 8",
  "Class 9",
  "Class 10",
  "Class 11",
  "Class 12",
  "Others",
];
const SHOE_SIZES = Array.from({ length: 13 }, (_, i) => String(i + 1));

type FormData = {
  game: string;
  admissionNumber: string;
  studentName: string;
  motherName: string;
  fatherName: string;
  dobDate: string;
  dobMonth: string;
  dobYear: string;
  gender: string;
  ageGroup: string;
  studentClass: string;
  mobileNo: string;
  shoeSize: string;
  tShirtShortsSize: string;
  trackSuitSize: string;
  blazerSize: string;
  food: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  game: "",
  admissionNumber: "",
  studentName: "",
  motherName: "",
  fatherName: "",
  dobDate: "",
  dobMonth: "",
  dobYear: "",
  gender: "",
  ageGroup: "",
  studentClass: "",
  mobileNo: "",
  shoeSize: "",
  tShirtShortsSize: "",
  trackSuitSize: "",
  blazerSize: "",
  food: "",
};

function validate(form: FormData): FormErrors {
  const errors: FormErrors = {};
  const req = (k: keyof FormData, label: string) => {
    if (!form[k]) errors[k] = `${label} is required`;
  };
  req("game", "Game");
  req("admissionNumber", "Admission Number");
  req("studentName", "Student Name");
  req("motherName", "Mother's Name");
  req("fatherName", "Father's Name");
  req("dobDate", "Date of Birth (Day)");
  req("dobMonth", "Date of Birth (Month)");
  req("dobYear", "Date of Birth (Year)");
  req("gender", "Gender");
  req("ageGroup", "Age Group");
  req("studentClass", "Class");
  req("shoeSize", "Shoe Size");
  req("tShirtShortsSize", "T-Shirt & Shorts Size");
  req("trackSuitSize", "Track Suit Size");
  req("blazerSize", "Blazer Size");
  req("food", "Food Preference");
  if (!form.mobileNo) {
    errors.mobileNo = "Mobile number is required";
  } else if (!/^\d{10}$/.test(form.mobileNo)) {
    errors.mobileNo = "Mobile number must be exactly 10 digits";
  }
  return errors;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </span>
  );
}

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="text-xs text-destructive mt-1" data-ocid="form.error_state">
      {msg}
    </p>
  );
}

export default function RegistrationPage({ onSuccess, onAdminClick }: Props) {
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const { mutateAsync, isPending } = useSubmitRegistration();
  const { actor, isFetching: actorLoading } = useActor();

  const isSubmitDisabled = isPending || actorLoading || !actor;

  const set = (k: keyof FormData, v: string) => {
    setForm((prev) => ({ ...prev, [k]: v }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      toast.error("Please fix the errors before submitting.");
      const firstError = document.querySelector(
        "[data-ocid='form.error_state']",
      );
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    try {
      const id = await mutateAsync({
        game: form.game,
        admissionNumber: form.admissionNumber,
        studentName: form.studentName,
        motherName: form.motherName,
        fatherName: form.fatherName,
        dobDate: BigInt(form.dobDate),
        dobMonth: BigInt(form.dobMonth),
        dobYear: BigInt(form.dobYear),
        gender: form.gender,
        ageGroup: form.ageGroup,
        studentClass: form.studentClass,
        mobileNo: form.mobileNo,
        shoeSize: form.shoeSize,
        tShirtShortsSize: form.tShirtShortsSize,
        trackSuitSize: form.trackSuitSize,
        blazerSize: form.blazerSize,
        food: form.food,
      });
      onSuccess(id);
    } catch {
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="bg-card shadow-xs sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">
              Sports Academy
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#home"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
              data-ocid="nav.link"
            >
              Home
            </a>
            <a
              href="#home"
              className="text-sm font-semibold uppercase tracking-wide text-primary border-b-2 border-primary pb-0.5"
              data-ocid="nav.link"
            >
              Register
            </a>
            <button
              type="button"
              onClick={onAdminClick}
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary transition-colors"
              data-ocid="nav.admin_link"
            >
              Admin Dashboard
            </button>
          </nav>
          <Button
            onClick={onAdminClick}
            variant="default"
            className="rounded-full bg-primary text-primary-foreground uppercase text-xs font-bold tracking-wider"
            data-ocid="admin.open_modal_button"
          >
            <Shield className="w-4 h-4 mr-1" />
            Admin
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative h-64 md:h-80 overflow-hidden">
        <img
          src="/assets/generated/sports-hero-banner.dim_1400x500.jpg"
          alt="Students playing sports"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold text-white leading-tight"
          >
            Annual Sports Registration
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-3 text-white/80 text-base md:text-lg max-w-xl"
          >
            Register your participation in the school sports event. Fill in all
            details carefully.
          </motion.p>
        </div>
      </section>

      {/* Form */}
      <main className="flex-1 py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-center text-xl md:text-2xl font-bold uppercase tracking-widest text-foreground mb-8">
            Student Sports Registration Form
          </h2>

          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-card rounded-2xl shadow-card p-6 md:p-10">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Game */}
                <div className="space-y-1.5">
                  <Label htmlFor="game">
                    <FieldLabel>Game / Sport</FieldLabel>
                  </Label>
                  <div className="relative">
                    <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="game"
                      placeholder="e.g. Football, Cricket, Athletics"
                      value={form.game}
                      onChange={(e) => set("game", e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      data-ocid="form.input"
                    />
                  </div>
                  <ErrorMsg msg={errors.game} />
                </div>

                {/* Admission Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="admissionNumber">
                    <FieldLabel>Admission Number</FieldLabel>
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="admissionNumber"
                      placeholder="Enter admission number"
                      value={form.admissionNumber}
                      onChange={(e) => set("admissionNumber", e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      data-ocid="form.input"
                    />
                  </div>
                  <ErrorMsg msg={errors.admissionNumber} />
                </div>

                {/* Student Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="studentName">
                    <FieldLabel>Name of Student</FieldLabel>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="studentName"
                      placeholder="Full name"
                      value={form.studentName}
                      onChange={(e) => set("studentName", e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      data-ocid="form.input"
                    />
                  </div>
                  <ErrorMsg msg={errors.studentName} />
                </div>

                {/* Mother's Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="motherName">
                    <FieldLabel>Mother's Name</FieldLabel>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="motherName"
                      placeholder="Mother's full name"
                      value={form.motherName}
                      onChange={(e) => set("motherName", e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      data-ocid="form.input"
                    />
                  </div>
                  <ErrorMsg msg={errors.motherName} />
                </div>

                {/* Father's Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="fatherName">
                    <FieldLabel>Father's Name</FieldLabel>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="fatherName"
                      placeholder="Father's full name"
                      value={form.fatherName}
                      onChange={(e) => set("fatherName", e.target.value)}
                      className="pl-9 bg-secondary border-border"
                      data-ocid="form.input"
                    />
                  </div>
                  <ErrorMsg msg={errors.fatherName} />
                </div>

                {/* Mobile No */}
                <div className="space-y-1.5">
                  <Label htmlFor="mobileNo">
                    <FieldLabel>Mobile No</FieldLabel>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mobileNo"
                      placeholder="10-digit mobile number"
                      value={form.mobileNo}
                      onChange={(e) =>
                        set(
                          "mobileNo",
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        )
                      }
                      className="pl-9 bg-secondary border-border"
                      inputMode="numeric"
                      data-ocid="form.input"
                    />
                  </div>
                  <ErrorMsg msg={errors.mobileNo} />
                </div>
              </div>

              {/* Date of Birth */}
              <div className="mt-6 space-y-1.5">
                <FieldLabel>Date of Birth</FieldLabel>
                <div className="grid grid-cols-3 gap-3 mt-1.5">
                  <div>
                    <Select
                      value={form.dobDate}
                      onValueChange={(v) => set("dobDate", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="form.select"
                      >
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <SelectValue placeholder="Day" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) =>
                          String(i + 1),
                        ).map((d) => (
                          <SelectItem key={d} value={d}>
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.dobDate} />
                  </div>
                  <div>
                    <Select
                      value={form.dobMonth}
                      onValueChange={(v) => set("dobMonth", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="form.select"
                      >
                        <SelectValue placeholder="Month" />
                      </SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => (
                          <SelectItem key={m} value={String(i + 1)}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.dobMonth} />
                  </div>
                  <div>
                    <Select
                      value={form.dobYear}
                      onValueChange={(v) => set("dobYear", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border"
                        data-ocid="form.select"
                      >
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 25 }, (_, i) =>
                          String(2000 + i),
                        ).map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.dobYear} />
                  </div>
                </div>
              </div>

              {/* Gender + Age Group + Class */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gender */}
                <div className="space-y-2">
                  <FieldLabel>Gender</FieldLabel>
                  <RadioGroup
                    value={form.gender}
                    onValueChange={(v) => set("gender", v)}
                    className="flex gap-6 mt-1"
                    data-ocid="form.radio"
                  >
                    {["Male", "Female", "Other"].map((g) => (
                      <div key={g} className="flex items-center gap-2">
                        <RadioGroupItem value={g} id={`gender-${g}`} />
                        <Label
                          htmlFor={`gender-${g}`}
                          className="cursor-pointer font-medium text-sm"
                        >
                          {g}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  <ErrorMsg msg={errors.gender} />
                </div>

                {/* Age Group */}
                <div className="space-y-1.5">
                  <FieldLabel>Age Group</FieldLabel>
                  <Select
                    value={form.ageGroup}
                    onValueChange={(v) => set("ageGroup", v)}
                  >
                    <SelectTrigger
                      className="bg-secondary border-border mt-1"
                      data-ocid="form.select"
                    >
                      <SelectValue placeholder="Select age group" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_GROUPS.map((ag) => (
                        <SelectItem key={ag} value={ag}>
                          {ag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMsg msg={errors.ageGroup} />
                </div>

                {/* Class */}
                <div className="space-y-1.5">
                  <FieldLabel>Class</FieldLabel>
                  <Select
                    value={form.studentClass}
                    onValueChange={(v) => set("studentClass", v)}
                  >
                    <SelectTrigger
                      className="bg-secondary border-border mt-1"
                      data-ocid="form.select"
                    >
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMsg msg={errors.studentClass} />
                </div>

                {/* Shoe Size */}
                <div className="space-y-1.5">
                  <FieldLabel>Shoe Size (UK)</FieldLabel>
                  <Select
                    value={form.shoeSize}
                    onValueChange={(v) => set("shoeSize", v)}
                  >
                    <SelectTrigger
                      className="bg-secondary border-border mt-1"
                      data-ocid="form.select"
                    >
                      <SelectValue placeholder="Select shoe size" />
                    </SelectTrigger>
                    <SelectContent>
                      {SHOE_SIZES.map((s) => (
                        <SelectItem key={s} value={s}>
                          UK {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <ErrorMsg msg={errors.shoeSize} />
                </div>
              </div>

              {/* Clothing Sizes */}
              <div className="mt-8">
                <div className="flex items-center gap-3 mb-5">
                  <Shirt className="w-5 h-5 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">
                    Clothing Sizes
                  </h3>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* T-Shirt & Shorts */}
                  <div className="space-y-1.5">
                    <FieldLabel>T-Shirt &amp; Shorts Size</FieldLabel>
                    <Select
                      value={form.tShirtShortsSize}
                      onValueChange={(v) => set("tShirtShortsSize", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border mt-1"
                        data-ocid="form.select"
                      >
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.tShirtShortsSize} />
                  </div>

                  {/* Track Suit */}
                  <div className="space-y-1.5">
                    <FieldLabel>Track Suit Size</FieldLabel>
                    <Select
                      value={form.trackSuitSize}
                      onValueChange={(v) => set("trackSuitSize", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border mt-1"
                        data-ocid="form.select"
                      >
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.trackSuitSize} />
                  </div>

                  {/* Blazer */}
                  <div className="space-y-1.5">
                    <FieldLabel>Blazer Size</FieldLabel>
                    <Select
                      value={form.blazerSize}
                      onValueChange={(v) => set("blazerSize", v)}
                    >
                      <SelectTrigger
                        className="bg-secondary border-border mt-1"
                        data-ocid="form.select"
                      >
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent>
                        {CLOTHING_SIZES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <ErrorMsg msg={errors.blazerSize} />
                  </div>
                </div>
              </div>

              {/* Food Preference */}
              <div className="mt-6 space-y-2">
                <div className="flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-primary" />
                  <FieldLabel>Food Preference</FieldLabel>
                </div>
                <RadioGroup
                  value={form.food}
                  onValueChange={(v) => set("food", v)}
                  className="flex gap-8 mt-1"
                  data-ocid="form.radio"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Veg" id="food-veg" />
                    <Label
                      htmlFor="food-veg"
                      className="cursor-pointer font-semibold text-sm text-green-700"
                    >
                      🥦 Veg
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="Non-Veg" id="food-nonveg" />
                    <Label
                      htmlFor="food-nonveg"
                      className="cursor-pointer font-semibold text-sm text-orange-700"
                    >
                      🍗 Non-Veg
                    </Label>
                  </div>
                </RadioGroup>
                <ErrorMsg msg={errors.food} />
              </div>

              {/* Submit */}
              <div className="mt-10">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="w-full rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-sm py-6"
                  data-ocid="form.submit_button"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : actorLoading || !actor ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-10">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Trophy className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">Sports Academy</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()}. Built with ❤️ using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-primary"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
