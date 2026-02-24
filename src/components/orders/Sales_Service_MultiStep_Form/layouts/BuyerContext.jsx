'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export default function BuyerContext() {
  return (
    <section className="space-y-6">
      {/* Buyer Name */}
      <div className="space-y-2">
        <Label htmlFor="buyerName">
          Buyer Name <span className="text-red-500">*</span>
        </Label>
        <Select>
          <SelectTrigger id="buyerName">
            <SelectValue placeholder="Select buyer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="acme">Acme Corp Pvt Ltd</SelectItem>
            <SelectItem value="globex">Globex Pvt Ltd</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid Fields */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Contact Person */}
        <div className="space-y-2">
          <Label htmlFor="contactPerson">
            Contact Person <span className="text-red-500">*</span>
          </Label>
          <Input id="contactPerson" placeholder="Rajesh Kumar" disabled />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="rajesh.kumar@acmecorp.in"
            disabled
          />
        </div>

        {/* Mobile */}
        <div className="space-y-2">
          <Label htmlFor="mobile">
            Mobile <span className="text-red-500">*</span>
          </Label>
          <Input id="mobile" placeholder="+91 98765 43210" disabled />
        </div>

        {/* Billing Address */}
        <div className="space-y-2">
          <Label htmlFor="billingAddress">
            Billing Address <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="billingAddress"
            rows={3}
            placeholder="123 MG Road, Indiranagar, Bangalore 560038"
            disabled
          />
        </div>
      </div>

      {/* Service Location */}
      <div className="space-y-2">
        <Label htmlFor="serviceLocation">
          Service Location / Delivery Address{' '}
          <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="serviceLocation"
          rows={3}
          placeholder="123 MG Road, Indiranagar, Bangalore 560038"
          disabled
        />
      </div>
    </section>
  );
}
