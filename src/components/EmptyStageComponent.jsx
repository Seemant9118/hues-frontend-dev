const EmptyStageComponent = ({ heading,subHeading, subItems }) => {
    return (
        <div className="p-5 my-5 flex flex-col justify-center gap-2 rounded-md  bg-gray-100">
            <h1 className="text-sm font-bold">{heading}</h1>
            <div className="px-2 flex flex-col gap-1">
                <h2 className="text-sm font-bold">{subHeading}</h2>
                <ul className="text-sm flex flex-col gap-2 px-6 text-neutral-500 list-disc">
                    {
                        subItems?.map((subItem) => (
                            <li key={subItem.id}><span className="text-neutral-500 font-semibold">{subItem.subItemtitle}</span> {subItem.item}</li>
                        ))
                    }
                </ul>
            </div>
        </div>
    );
};

export default EmptyStageComponent;