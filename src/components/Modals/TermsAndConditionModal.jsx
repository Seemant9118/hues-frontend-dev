'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '../ui/button';

const TermsAnsConditionModal = ({ isOpen, onClose, onDecline, onAgree }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex flex-col justify-center gap-5">
        <DialogTitle>Terms and condition</DialogTitle>
        <div className="scrollBarStyles max-h-[300px] overflow-y-auto text-sm">
          {/* Terms and Conditions Content */}
          Welcome to hues. By accessing and using our services, you agree to
          comply with and be bound by these Terms and Conditions. Please read
          them carefully. To use our services, you must be at least 18 years old
          and legally capable of entering into a binding contract. By using our
          services, you confirm that you meet these requirements. You also agree
          to use our services only for lawful purposes and in a manner that does
          not infringe the rights of others. Unauthorized use of our services or
          any attempt to access, modify, or interfere with our systems or data
          is strictly prohibited. To access certain services, you may need to
          register an account. You are responsible for keeping your account
          details secure and must notify us immediately if you suspect any
          unauthorized use. All content, trademarks, and intellectual property
          available on our platform are owned by hues or its licensors.
          Unauthorized use of any material is prohibited unless expressly
          permitted. If there are any fees associated with our services, you
          agree to pay all applicable charges, which are non-refundable unless
          otherwise required by law or specified in our refund policy. By
          submitting content to our platform, you grant us a non-exclusive,
          worldwide, royalty-free license to use, display, and distribute your
          content as part of our services. hues shall not be liable for any
          direct, indirect, incidental, or consequential damages resulting from
          the use or inability to use our services, to the fullest extent
          permitted by law. We may update these Terms and Conditions
          periodically, and it is your responsibility to check for updates, as
          continued use of our services signifies acceptance of any revised
          terms. We reserve the right to terminate your access to our services
          at our discretion, without notice, if you breach these Terms and
          Conditions. These terms are governed by the laws of Jurisdiction, and
          any disputes shall be resolved in accordance with the courts of
          Jurisdiction. For any questions or concerns regarding these Terms and
          Conditions, please contact us at +91 9876543210
        </div>

        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onDecline}>
            Decline
          </Button>
          <Button
            size="sm"
            onClick={onAgree} // Call onAgree to update checkbox and close modal
          >
            Agree
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAnsConditionModal;
