"use client";

import Link from "next/link";
import type { AccountUser, Address } from "@/entities/order/types";

interface Props {
  user: AccountUser | null;
  address: Address | null;
  isLoading: boolean;
}

function addressLines(address: Address): string[] {
  const name =
    address.name ||
    [address.first_name, address.last_name].filter(Boolean).join(" ");
  const cityLine = [address.city, address.province, address.zip]
    .filter(Boolean)
    .join(", ");
  return [
    name,
    address.company,
    address.address1,
    address.address2,
    cityLine,
    address.country,
    address.phone,
  ].filter((l): l is string => Boolean(l && l.trim()));
}

export function AccountDetails({ user, address, isLoading }: Props) {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Account details */}
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-text-main">
            Account Details
          </h2>
          <Link
            href="/user/profile"
            className="text-sm font-bold text-primary hover:text-primary-dark"
          >
            Edit Profile
          </Link>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-text-muted">
              person
            </span>
            <span className="text-text-main">{user?.fullName || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-text-muted">
              mail
            </span>
            <span className="text-text-main">{user?.email || "—"}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px] text-text-muted">
              lock
            </span>
            <Link
              href="/user/profile"
              className="font-bold text-primary hover:text-primary-dark"
            >
              Change password
            </Link>
          </div>
        </dl>
      </div>

      {/* Default address */}
      <div className="rounded-xl bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-black text-text-main">
            Default Address
          </h2>
          <Link
            href="/user/orders"
            className="text-sm font-bold text-primary hover:text-primary-dark"
          >
            Manage Address
          </Link>
        </div>

        <div className="mt-4 text-sm">
          {isLoading && (
            <div className="space-y-2">
              <div className="h-4 w-2/3 animate-pulse rounded bg-cream" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-cream" />
              <div className="h-4 w-1/3 animate-pulse rounded bg-cream" />
            </div>
          )}

          {!isLoading && !address && (
            <p className="text-text-muted">
              No saved address yet. It will appear here after your first order.
            </p>
          )}

          {!isLoading && address && (
            <address className="not-italic leading-relaxed text-text-main">
              {addressLines(address).map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </address>
          )}
        </div>
      </div>
    </section>
  );
}
