import { deliveryProcess } from '@/api/deliveryProcess/deliveryProcess';
import {
  getStylesForSelectComponent,
  saveDraftToSession,
} from '@/appUtils/helperFunctions';
import { LocalStorageService, SessionStorageService } from '@/lib/utils';
import { addBookingToDispatchNote } from '@/services/Delivery_Process_Services/DeliveryProcessServices';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CalendarDays, Plus } from 'lucide-react';
import moment from 'moment';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { getAddressByEnterprise } from '@/services/address_Services/AddressServices';
import { addressAPIs } from '@/api/addressApi/addressApis';
import { settingsAPI } from '@/api/settings/settingsApi';
import { addUpdateAddress } from '@/services/Settings_Services/SettingsService';
import ReactSelect from 'react-select';
import { vendorEnterprise } from '@/api/enterprises_user/vendor_enterprise/vendor_enterprise';
import {
  createVendor,
  getVendors,
} from '@/services/Enterprises_Users_Service/Vendor_Enterprise_Services/Vendor_Eneterprise_Service';
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
import AddNewAddress from '../enterprise/AddNewAddress';
import AddModal from '../Modals/AddModal';

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
  const enterpriseId = LocalStorageService.get('enterprise_Id');
  const bookingDraftData = SessionStorageService.get('bookingDataDraft');
  const router = useRouter();
  const [files, setFiles] = useState([]);
  const [bookingData, setBookingData] = useState({
    movementType: bookingDraftData?.movementType || '',
    legFrom: bookingDraftData?.legFrom || null,
    legTo: bookingDraftData?.legTo || null,
    transMode: bookingDraftData?.transMode || '',
    transporterEnterpriseId: bookingDraftData?.transporterEnterpriseId || null,
    transporterId: bookingDraftData?.transporterId || '',
    bookingType: bookingDraftData?.bookingType || '',
    bookingNumber: bookingDraftData?.bookingNumber || '',
    bookingDate: bookingDraftData?.bookingDate || '',
    remarks: bookingDraftData?.remarks || '',
    voucherId: Number(deliveryId),
  });

  const [selectLegFrom, setSelectLegFrom] = useState('');
  const [selectLegTo, setSelectLegTo] = useState('');
  const [selectTransport, setSelectTransport] = useState('');
  const [isAddingNewTransport, setIsAddingNewTransport] = useState(false);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [errorMsg, setErrorMsg] = useState({});

  const addressContext = 'legAddress';
  // get addresses
  const { data: legAddress } = useQuery({
    queryKey: [addressAPIs.getAddressByEnterprise.endpointKey, enterpriseId],
    queryFn: () => getAddressByEnterprise(enterpriseId, addressContext),
    select: (res) => res.data.data,
  });

  const legAddressOptions = [
    ...(legAddress || []).map((address) => {
      const value = address?.address;
      const label = address?.address;

      return { value, label };
    }),
    // Special option for "address New Address"
    {
      value: 'add-new-address', // Special value for "Add New Address"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {'Add new Address'}
        </span>
      ),
    },
  ];

  // vendors[transporter] fetching
  const { data: transports } = useQuery({
    queryKey: [vendorEnterprise.getVendors.endpointKey],
    queryFn: () => getVendors({ id: enterpriseId, context: 'ORDER' }),
    select: (res) => res.data.data.users,
  });
  // transport options
  const transportOptions = [
    ...(transports || []).map((vendor) => {
      const value = vendor?.id;
      const label =
        vendor?.vendor?.name || vendor.invitation?.userDetails?.name;

      return { value, label };
    }),
    {
      value: null, // if no transport than user can select this"
      label: 'Self',
    },
    // Special option for "Add New Transport"
    {
      value: 'add-new-transport', // Special value for "Add New Transport"
      label: (
        <span className="flex h-full w-full cursor-pointer items-center gap-2 text-xs font-semibold text-black">
          <Plus size={14} /> {'Add new transport'}
        </span>
      ),
    },
  ];

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

    if (!data.movementType) errors.movementType = 'Movement type is required';
    if (!data.legFrom) errors.legFrom = 'Leg from is required';
    if (!data.legTo) errors.legTo = 'Leg to is required';
    if (!data.transMode) errors.transMode = 'Transport mode is required';
    if (!data.transporterEnterpriseId)
      errors.transporterEnterpriseId = 'Transporter is required';
    if (!data.transporterId?.trim())
      errors.transporterId = 'Transporter ID is required';
    if (!data.bookingType) errors.bookingType = 'Booking type is required';
    if (!data.bookingNumber?.trim())
      errors.bookingNumber = 'Booking number is required';
    if (!data.bookingDate) errors.bookingDate = 'Booking date is required';

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
    formData.append('movementType', bookingData.movementType);
    formData.append('legFrom', bookingData.legFrom);
    formData.append('legTo', bookingData.legTo);
    formData.append('transMode', bookingData.transMode);
    formData.append(
      'transporterEnterpriseId',
      bookingData.transporterEnterpriseId,
    );
    formData.append('transporterId', bookingData.transporterId);

    formData.append('bookingType', bookingData.bookingType);
    formData.append('bookingNumber', bookingData.bookingNumber);
    const formattedPaymentDate = moment(
      bookingData.bookingDate,
      'DD/MM/YYYY',
    ).format('YYYY-MM-DD');
    formData.append('bookingDate', formattedPaymentDate);
    formData.append('remarks', bookingData.remarks);
    formData.append('voucherId', deliveryId);
    formData.append('dispatchNoteId', dispatchNoteId);

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
            <section className="flex flex-col gap-4 rounded-md border p-4">
              <h1 className="text-sm font-bold">
                Movement Type <span className="text-red-500">*</span>
              </h1>

              <div className="mt-1 flex flex-col gap-3">
                {[
                  'Internal logistics (stock transfer / repositioning)',
                  'Supply for sale (final delivery to customer)',
                ].map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="movementType"
                      value={option}
                      checked={bookingData.movementType === option}
                      onChange={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          movementType: option,
                        }))
                      }
                      className="accent-primary"
                    />
                    <span>{option}</span>
                  </label>
                ))}
                {errorMsg?.movementType && (
                  <ErrorBox msg={errorMsg?.movementType} />
                )}
              </div>
            </section>

            <section className="flex flex-col gap-4 rounded-md border p-4">
              <h1 className="text-sm font-bold">
                Leg Details <span className="text-red-500">*</span>
              </h1>

              <div className="grid grid-cols-2 gap-3">
                {/* Leg address from */}
                <div className="flex flex-col gap-1">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {'Leg from'}
                    </Label>{' '}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Dispatch Select */}
                    <ReactSelect
                      name="legFrom"
                      placeholder={'Select origin'}
                      options={legAddressOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-full text-sm"
                      classNamePrefix="select"
                      value={bookingData ? selectLegFrom?.selectedValue : ''}
                      onChange={(selectedOption) => {
                        if (!selectedOption) return;

                        if (selectedOption.value === 'add-new-address') {
                          setIsAddingNewAddress(true);
                          return;
                        }

                        setSelectLegFrom({
                          legFrom: selectedOption.value,
                          selectedValue: selectedOption,
                        });

                        setBookingData((prev) => ({
                          ...prev,
                          legFrom: selectedOption.value,
                        }));
                      }}
                    />
                    {errorMsg?.legFrom && <ErrorBox msg={errorMsg?.legFrom} />}
                  </div>
                </div>

                {/* leg address to */}
                <div className="flex flex-col gap-1">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {'Leg to'}
                    </Label>{' '}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Dispatch Select */}
                    <ReactSelect
                      name="legTo"
                      placeholder={'Select destination'}
                      options={legAddressOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-full text-sm"
                      classNamePrefix="select"
                      value={bookingData ? selectLegTo?.selectedValue : ''}
                      onChange={(selectedOption) => {
                        if (!selectedOption) return;

                        if (selectedOption.value === 'add-new-address') {
                          setIsAddingNewAddress(true);
                          return;
                        }

                        setSelectLegTo({
                          legTo: selectedOption.value,
                          selectedValue: selectedOption,
                        });

                        setBookingData((prev) => ({
                          ...prev,
                          legTo: selectedOption.value,
                        }));
                      }}
                    />
                    {errorMsg?.legTo && <ErrorBox msg={errorMsg?.legTo} />}
                  </div>

                  {/* add new address : visible if isAddingNewAddress is true */}
                  <AddNewAddress
                    isLegAddressAdding={true}
                    isAddressAdding={isAddingNewAddress}
                    setIsAddressAdding={setIsAddingNewAddress}
                    mutationKey={settingsAPI.addUpdateAddress.endpointKey}
                    mutationFn={addUpdateAddress}
                    invalidateKey={deliveryProcess.getDispatchNote.endpointKey}
                  />
                </div>

                {/* transport mode */}
                <div className="flex flex-col gap-1">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {'Transport Mode'}
                    </Label>{' '}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Select
                      value={bookingData?.transMode}
                      onValueChange={(value) => {
                        // Check if a booking type is selected (non-empty value)
                        if (value) {
                          setErrorMsg((prevMsg) => ({
                            ...prevMsg,
                            transMode: '', // Clear the booking type error message
                          }));
                        }

                        const updatedBookingData = {
                          ...bookingData,
                          transMode: value,
                        };
                        setBookingData(updatedBookingData);

                        saveDraftToSession({
                          key: 'bookingDataDraft',
                          data: updatedBookingData,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={'Select Transport mode'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ROAD">{'Road'}</SelectItem>
                        <SelectItem value="RAIL">{'Rail'}</SelectItem>
                        <SelectItem value="AIR">{'Air'}</SelectItem>
                        <SelectItem value="SHIP">{'Ship'}</SelectItem>
                      </SelectContent>
                    </Select>

                    {errorMsg?.transMode && (
                      <ErrorBox msg={errorMsg?.transMode} />
                    )}
                  </div>
                </div>

                {/* transporter */}
                <div className="flex flex-col gap-1">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {'Transporter'}
                    </Label>{' '}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    {/* Dispatch Select */}
                    <ReactSelect
                      name="transporterEnterpriseId"
                      placeholder={'Select Transporter'}
                      options={transportOptions}
                      styles={getStylesForSelectComponent()}
                      className="max-w-full text-sm"
                      classNamePrefix="select"
                      value={bookingData ? selectTransport?.selectedValue : ''}
                      onChange={(selectedOption) => {
                        if (!selectedOption) return;

                        if (selectedOption.value === 'add-new-transport') {
                          setIsAddingNewTransport(true);
                          return;
                        }

                        setSelectTransport({
                          transporterEnterpriseId: selectedOption.value,
                          selectedValue: selectedOption,
                        });

                        setBookingData((prev) => ({
                          ...prev,
                          transporterEnterpriseId: selectedOption.value,
                        }));
                      }}
                    />
                    {errorMsg?.transporterEnterpriseId && (
                      <ErrorBox msg={errorMsg?.transporterEnterpriseId} />
                    )}
                  </div>

                  {/* Add Vendor Modal */}
                  {isAddingNewTransport && (
                    <AddModal
                      type={'Add'}
                      cta="vendor"
                      btnName={'Add new transport'}
                      mutationFunc={createVendor}
                      isOpen={isAddingNewTransport}
                      setIsOpen={setIsAddingNewTransport}
                    />
                  )}
                </div>

                {/* transport GSTIN */}
                <div className="flex flex-col gap-1">
                  <div>
                    <Label className="flex-shrink-0 text-sm font-semibold">
                      {'Transporter ID (GSTIN/TRANSIN)'}
                    </Label>{' '}
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <Input
                      name="transporterId"
                      className="max-w-md"
                      value={bookingData?.transporterId}
                      onChange={handleInputChange}
                      placeholder={'Enter (GSTIN/TRANSIN)'}
                    />

                    {errorMsg?.transporterId && (
                      <ErrorBox msg={errorMsg?.transporterId} />
                    )}
                  </div>
                </div>
              </div>
            </section>

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
