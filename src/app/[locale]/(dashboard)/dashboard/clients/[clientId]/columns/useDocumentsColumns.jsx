export const useDocumentsColumns = ({ translations }) => {
  return [
    {
      accessorKey: 'directorName',
      header: translations('tabs.tab2.content.overview_labels.director_name'),
    },
    {
      accessorKey: 'directorNumber',
      header: translations('tabs.tab2.content.overview_labels.director_number'),
    },
    {
      accessorKey: 'pan',
      header: translations('tabs.tab2.content.overview_labels.pan'),
    },
    {
      accessorKey: 'gst',
      header: translations('tabs.tab2.content.overview_labels.gst'),
    },
    {
      accessorKey: 'cin',
      header: translations('tabs.tab2.content.overview_labels.cin'),
    },
    {
      accessorKey: 'udyam',
      header: translations('tabs.tab2.content.overview_labels.udyam'),
    },
  ];
};
