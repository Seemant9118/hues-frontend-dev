import Step1Supply from './steps/Step1Supply';
import Step2FromDetails from './steps/Step2FromDetails';
import Step3ToDetails from './steps/Step3ToDetails';
import Step4Items from './steps/Step4Items';
import Step5Transport from './steps/Step5Transport';

export const stepsConfigA = [
  {
    key: 'supply',
    title: 'Supply Details',
    component: Step1Supply,
    validate: (form) => {
      const e = {};
      if (!form.supplyType) e.supplyType = 'Select supply type';
      if (!form.subSupplyType) e.subSupplyType = 'Select sub supply type';
      if (form?.subSupplyType === '10' && !form?.subSupplyDesc)
        e.subSupplyDesc = `Sub Supply Description is required for 'Others'.`;
      if (!form.docType) e.docType = 'Select document type';
      if (!form.docNo) e.docNo = 'Document number is required';
      if (!form.docDate) e.docDate = 'Document date is required';
      else {
        const docDate = new Date(form.docDate);
        const today = new Date();
        if (docDate > today) e.docDate = 'Document date cannot be in future';
        const diffDays = Math.floor((today - docDate) / (1000 * 60 * 60 * 24));
        if (diffDays > 180)
          e.docDate = 'Document date should be within 180 days';
      }
      return e;
    },
  },
  {
    key: 'fromDetails',
    title: 'Consignor Details',
    component: Step2FromDetails,
    validate: (form) => {
      const e = {};
      if (!form.fromGstin) e.fromGstin = 'From GSTIN required';
      return e;
    },
  },
  {
    key: 'toDetails',
    title: 'Consignee Details',
    component: Step3ToDetails,
    validate: (form) => {
      const e = {};
      if (!form.toGstin) e.toGstin = 'To GSTIN required';
      return e;
    },
  },
  {
    key: 'items',
    title: 'Item Details',
    component: Step4Items,
    validate: (form) => {
      const e = {};
      if (!form.itemList || form.itemList.length === 0)
        e.itemList = 'At least one item required';
      return e;
    },
  },
  // {
  //   key: 'transport',
  //   title: 'Transport Details',
  //   component: Step5Transport,
  //   validate: (form) => {
  //     const e = {};
  //     if (form.transMode !== '1' && !form.transDocNo) {
  //       e.transDocNo = 'Transport document number required for selected mode';
  //     }
  //     return e;
  //   },
  // },
];

export const stepsConfigB = [
  {
    key: 'transport',
    title: 'Transport Details',
    component: Step5Transport,
    validate: (form) => {
      const e = {};
      if (form.transMode !== '1' && !form.transDocNo) {
        e.transDocNo = 'Transport document number required for selected mode';
      }
      return e;
    },
  },
];
