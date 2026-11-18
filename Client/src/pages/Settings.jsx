
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  User,
  Lock,
  Shield,
  Mail,
  KeyRound,
} from "lucide-react";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Field,
  Badge,
  Avatar,
} from "../components/ui";

import { PageHeader } from "../components/common/PageHeader";
import { useAuth } from "../context/AuthContext";
import { authApi } from "../lib/services";
import { shortDate } from "../lib/format";
import { cn } from "../lib/utils";

/* ─────────────────────────────────────────────
   Section icon
───────────────────────────────────────────── */

function SectionIcon({ icon: Icon, className }) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50",
        className
      )}
    >
      <Icon className="h-4 w-4 text-brand-700" />
    </div>
  );
}

/* ─────────────────────────────────────────────
   Profile settings
───────────────────────────────────────────── */

function ProfileCard({ user, updateUser }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    if (!user) return;

    reset({
      name: user.name || "",
      company: user.company || "",
      avatar: user.avatar || "",
    });
  }, [user, reset]);

  const onSubmit = async (form) => {
    try {
      const res = await authApi.updateProfile(form);

      // Supports both { data: { user } } and { user } responses.
      const updatedUser =
        res?.data?.user ??
        res?.user ??
        res?.data;

      if (!updatedUser) {
        throw new Error("Invalid profile response from server.");
      }

      updateUser(updatedUser);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.message || "Could not update profile.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <SectionIcon icon={User} />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-line bg-surface-muted px-4 py-3">
          <Avatar
            name={user?.name}
            src={user?.avatar}
            size="lg"
          />

          <div>
            <p className="text-sm font-semibold text-ink">
              {user?.name}
            </p>
            <p className="text-xs text-ink-soft">
              {user?.email}
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Full name"
              error={errors.name?.message}
              className="sm:col-span-2"
            >
              <Input
                placeholder="Your full name"
                {...register("name", {
                  required: "Name is required",
                })}
              />
            </Field>

            <Field label="Company">
              <Input
                placeholder="Your company"
                {...register("company")}
              />
            </Field>

            <Field label="Email address">
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />

                <Input
                  value={user?.email || ""}
                  disabled
                  readOnly
                  className="pl-9"
                />
              </div>

              <p className="mt-1 text-xs text-ink-soft">
                Email cannot be changed from settings.
              </p>
            </Field>

            <Field
              label="Avatar URL"
              error={errors.avatar?.message}
              className="sm:col-span-2"
            >
              <Input
                placeholder="https://example.com/photo.jpg"
                {...register("avatar")}
              />
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={isSubmitting}>
              Save changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   Security settings
───────────────────────────────────────────── */

function SecurityCard() {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("password");

  const onSubmit = async ({ password }) => {
    try {
      await authApi.changePassword({ password });

      toast.success("Password updated successfully.");
      reset();
    } catch (err) {
      toast.error(err.message || "Could not update password.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <SectionIcon icon={Lock} />

          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>
              Change your account password.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="New password"
              error={errors.password?.message}
            >
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/50" />

                <Input
                  type="password"
                  placeholder="Min. 6 characters"
                  className="pl-9"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Must be at least 6 characters",
                    },
                  })}
                />
              </div>
            </Field>

            <Field
              label="Confirm new password"
              error={errors.confirmPassword?.message}
            >
              <Input
                type="password"
                placeholder="Re-enter password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === newPassword ||
                    "Passwords do not match",
                })}
              />
            </Field>
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" loading={isSubmitting}>
              Update password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   Account information
───────────────────────────────────────────── */

function AccountCard({ user, logout }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <SectionIcon icon={Shield} />

          <div>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your account details and session.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-surface-muted px-4 py-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Role
            </p>

            <Badge className="border border-brand-200/60 bg-brand-50 text-brand-700 capitalize">
              {user?.role || "Member"}
            </Badge>
          </div>

          <div className="rounded-2xl border border-line bg-surface-muted px-4 py-3">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-soft">
              Member since
            </p>

            <p className="text-sm font-semibold text-ink">
              {user?.createdAt
                ? shortDate(user.createdAt)
                : "—"}
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="danger" onClick={logout}>
            Log out
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─────────────────────────────────────────────
   Settings page
───────────────────────────────────────────── */

export default function Settings() {
  const { user, updateUser, logout } = useAuth();

  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader
        title="Settings"
        subtitle="Manage your account and personal information."
      />

      <ProfileCard
        user={user}
        updateUser={updateUser}
      />

      <SecurityCard />

      <AccountCard
        user={user}
        logout={logout}
      />
    </div>
  );
}
