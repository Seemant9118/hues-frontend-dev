import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import { saveDraftToSession } from '@/appUtils/helperFunctions';
import { SessionStorageService } from '@/lib/utils';
import { addBookingToDispatchNote } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useMutation } from '@tanstack/react-query';
import { CalendarDays } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import OrderBreadCrumbs from '../orders/OrderBreadCrumbs';
import { Button } from '../ui/button';
import DatePickers from '../ui/DatePickers';
import ErrorBox from '../ui/ErrorBox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import Loading from '../ui/Loading';
import Overview from '../ui/Overview';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
import AttachmentUploader from '../upload/AttachementUploader';
import Wrapper from '../wrappers/Wrapper';

const AddBooking = ({
  translations,
  overviewData,
  overviewLabels,
  customRender,
  customLabelRender,
  setTab,
  queryClient,
  dispatchNoteId,
  deliveryId,
  //   isAddingBooking,
  setIsAddingBooking,
  dispatchOrdersBreadCrumbs,
}) => {
  const router = useRouter();

  const bookingDraftData = SessionStorageService.get('bookingDataDraft');
  const [files, setFiles] = useState([]);
  const [bookingData, setBookingData] = useState({
    bookingType: bookingDraftData?.bookingType || '',
    bookingNumber: bookingDraftData?.bookingNumber || '',
    bookingDate: bookingDraftData?.bookingDate || '', // always store as string DD/MM/YYYY
    remarks: bookingDraftData?.remarks || '',
    sourceAddress: bookingDraftData?.sourceAddress || '',
    destinationAddress: bookingDraftData?.destinationAddress || '',
    voucherId: Number(deliveryId),
  });

  const [errorMsg, setErrorMsg] = useState({});
  // INPUT CHANGE HANDLER
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // For number field, store as string
    const updated = {
      ...bookingData,
      [name]: value,
    };

    setBookingData(updated);

    setErrorMsg((prev) => ({
      ...prev,
      [name]: '',
    }));

    saveDraftToSession({
      key: 'bookingDataDraft',
      data: updated,
    });
  };

  // VALIDATION
  const validation = (data) => {
    const errors = {};

    if (!data.bookingType?.trim()) {
      errors.bookingType = translations(
        'addBooking.errors.bookingTypeRequired',
      );
    }

    if (!data.bookingNumber?.trim()) {
      errors.bookingNumber = translations(
        'addBooking.errors.bookingNumberRequired',
      );
    }

    if (!data.bookingDate?.trim()) {
      errors.bookingDate = translations(
        'addBooking.errors.bookingDateRequired',
      );
    }

    return errors;
  };

  const createBookingMutation = useMutation({
    mutationFn: addBookingToDispatchNote,
    onSuccess: () => {
      toast.success(translations('addBooking.toast.success'));
      setBookingData({
        bookingType: '',
        bookingNumber: '',
        bookingDate: '',
        sourceAddress: '',
        destinationAddress: '',
      });
      setIsAddingBooking(false);
      setTab('transports');
      SessionStorageService.remove('bookingDataDraft');

      queryClient.invalidateQueries({
        queryKey: [deliveryProcess.getDeliveryChallan.endpointKey],
      });
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || translations('addBooking.toast.error'),
      );
    },
  });

  const handleSubmit = (bookingData) => {
    const errors = validation(bookingData);

    if (Object.keys(errors).length > 0) {
      setErrorMsg(errors);
      return;
    }

    // Build FormData
    const formData = new FormData();
    // handle files if any
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    formData.append('voucherId', deliveryId);
    formData.append('dispatchNoteId', dispatchNoteId);
    formData.append('bookingType', bookingData.bookingType);
    formData.append('bookingNumber', bookingData.bookingNumber);
    formData.append('sourceAddress', bookingData.sourceAddress);
    formData.append('destinationAddress', bookingData.destinationAddress);
    formData.append('remarks', bookingData.remarks);
    const formattedPaymentDate = moment(
      bookingData.bookingDate,
      'DD/MM/YYYY',
    ).format('YYYY-MM-DD');
    formData.append('bookingDate', formattedPaymentDate);

    setErrorMsg({});
    createBookingMutation.mutate({ dispatchNoteId, data: formData });
  };

  return (
    <Wrapper className="flex h-full flex-col justify-between">
      <div>
        {/* HEADER */}
        <section className="sticky top-0 z-10 flex items-center justify-between bg-white py-2">
          <OrderBreadCrumbs
            possiblePagesBreadcrumbs={dispatchOrdersBreadCrumbs}
          />
        </section>
        <div className="flex flex-col gap-2">
          {/* Collapsable overview */}
          {/* OVERVIEW SECTION */}
          <Overview
            collapsible={true}
            data={overviewData}
            labelMap={overviewLabels}
            customRender={customRender}
            customLabelRender={customLabelRender}
          />

          <div className="flex flex-col gap-4">
            {/* inputs */}
            <section className="flex flex-col gap-4 rounded-md border p-4">
              <div className="flex items-center gap-2">
                {/* select booking type */}
                <div className="flex w-1/2 flex-col gap-2">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {translations('addBooking.titles.bookingType')}
                    </Label>{' '}
                    <span className="text-red-600">*</span>
                  </div>

                  <Select
                    value={bookingData?.bookingType}
                    onValueChange={(value) => {
                      // Check if a booking type is selected (non-empty value)
                      if (value) {
                        setErrorMsg((prevMsg) => ({
                          ...prevMsg,
                          bookingType: '', // Clear the booking type error message
                        }));
                      }

                      const updatedBookingData = {
                        ...bookingData,
                        bookingType: value,
                      };
                      setBookingData(updatedBookingData);

                      saveDraftToSession({
                        key: 'bookingDataDraft',
                        data: updatedBookingData,
                      });
                    }}
                  >
                    <SelectTrigger className="max-w-md">
                      <SelectValue
                        placeholder={translations(
                          'addBooking.placeholders.selectType',
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LR">
                        {translations('addBooking.bookingTypes.lr')}
                      </SelectItem>
                      <SelectItem value="LB">
                        {translations('addBooking.bookingTypes.lb')}
                      </SelectItem>
                      <SelectItem value="AIRWAY">
                        {translations('addBooking.bookingTypes.airway')}
                      </SelectItem>
                      <SelectItem value="RAILWAY">
                        {translations('addBooking.bookingTypes.railway')}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {errorMsg?.bookingType && (
                    <ErrorBox msg={errorMsg?.bookingType} />
                  )}
                </div>
                {/* booking Number */}
                <div className="flex w-1/2 flex-col gap-2">
                  <div>
                    <Label className="text-sm font-semibold">
                      {translations('addBooking.titles.bookingNumber')}
                    </Label>{' '}
                    <span className="text-red-600">*</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Input
                      name="bookingNumber"
                      className="max-w-md"
                      value={bookingData?.bookingNumber}
                      onChange={handleInputChange}
                      placeholder={translations(
                        'addBooking.placeholders.enterBookingNumber',
                      )}
                    />
                  </div>
                  {errorMsg?.bookingNumber && (
                    <ErrorBox msg={errorMsg?.bookingNumber} />
                  )}
                </div>

                {/* select Date */}
                <div className="flex w-1/2 flex-col gap-2">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {translations('addBooking.titles.bookingDate')}
                    </Label>{' '}
                    <span className="text-red-600">*</span>
                  </div>
                  <div className="relative flex h-10 max-w-md rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <DatePickers
                      selected={
                        bookingData.bookingDate
                          ? moment(
                              bookingData.bookingDate,
                              'DD/MM/YYYY',
                            ).toDate()
                          : null
                      }
                      onChange={(date) => {
                        const formattedDate = moment(date).format('DD/MM/YYYY');

                        const updated = {
                          ...bookingData,
                          bookingDate: formattedDate,
                        };

                        setBookingData(updated);

                        saveDraftToSession({
                          key: 'bookingDataDraft',
                          data: updated,
                        });

                        setErrorMsg((prev) => ({ ...prev, bookingDate: '' }));
                      }}
                      dateFormat="dd/MM/yyyy"
                      popperPlacement="top-right"
                    />

                    <CalendarDays className="absolute right-2 top-1/2 z-0 -translate-y-1/2 text-[#3F5575]" />
                  </div>

                  {errorMsg?.bookingDate && (
                    <ErrorBox msg={errorMsg?.bookingDate} />
                  )}
                </div>
              </div>

              {/* remarks */}
              <div className="flex flex-col gap-1">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('addBooking.titles.remarks')}
                  </Label>{' '}
                </div>
                <Textarea
                  name="remarks"
                  value={bookingData?.remarks}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      remarks: e.target.value,
                    }));
                  }}
                  placeholder={translations(
                    'addBooking.placeholders.enterRemarks',
                  )}
                />
              </div>

              {/* source address */}
              <div className="flex flex-col gap-1">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('addBooking.titles.sourceAddress')}
                  </Label>{' '}
                </div>
                <Textarea
                  name="sourceAddress"
                  value={bookingData?.sourceAddress}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      sourceAddress: e.target.value,
                    }));
                  }}
                  placeholder={translations(
                    'addBooking.placeholders.enterSourceAddress',
                  )}
                />
              </div>

              {/* destination address */}
              <div className="flex flex-col gap-1">
                <div>
                  <Label className="flex-shrink-0 text-sm font-semibold">
                    {translations('addBooking.titles.destinationAddress')}
                  </Label>{' '}
                </div>
                <Textarea
                  name="destinationAddress"
                  value={bookingData?.destinationAddress}
                  onChange={(e) => {
                    setBookingData((prev) => ({
                      ...prev,
                      destinationAddress: e.target.value,
                    }));
                  }}
                  placeholder={translations(
                    'addBooking.placeholders.enterDestinationAddress',
                  )}
                />
              </div>
            </section>
            {/* uploads attachments */}
            <AttachmentUploader
              label={translations('addBooking.titles.addAttachments')}
              acceptedTypes={['png', 'pdf', 'jpg']}
              files={files}
              setFiles={setFiles}
            />
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 flex w-full justify-end gap-2 border-t-2 bg-white p-2">
        <Button
          variant="outline"
          className="w-32"
          size="sm"
          onClick={() => {
            // state clear
            setIsAddingBooking(false);
            setErrorMsg({});
            setBookingData(null);
            router.back();
          }}
        >
          {translations('addBooking.ctas.cancel')}
        </Button>
        <Button
          onClick={() => handleSubmit(bookingData)}
          disabled={createBookingMutation.isPending}
          size="sm"
          className="w-32 bg-[#288AF9] text-white hover:bg-primary hover:text-white"
        >
          {createBookingMutation.isPending ? (
            <Loading />
          ) : (
            translations('addBooking.ctas.addBooking')
          )}
        </Button>
      </div>
    </Wrapper>
  );
};

export default AddBooking;
