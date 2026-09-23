
type TableStatusFilterItem = {
  name:string;count:number;label:string;
}

interface TableStatusFilterBarProps {
  statusesItems: TableStatusFilterItem[];
  filter: Record<string, any>;
  setFilter: (name: string, value: any) => void;
  reloadTableData: () => void;
}


export default function TableStatusFilterBar({statusesItems, filter, setFilter, reloadTableData}: TableStatusFilterBarProps) {

  const setFilterOnStatus = (statusItemName: string):void =>  {
    setFilter('status', statusItemName);
    reloadTableData();
  }

  const statusIsActive = (statusItemName:string) :boolean => {
    if (filter.status === statusItemName) return true;
    return false;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {statusesItems.length > 0 && statusesItems.map((statusItem:TableStatusFilterItem, index:number) => (
          <button
            key={index}
            onClick={() => setFilterOnStatus(statusItem.name)}
            className={`flex items-center ${(statusIsActive(statusItem.name)) ? "bg-red-100 dark:bg-red-900" : ""}  gap-2 px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 border rounded text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300`}
          >
            <span>{statusItem.label}</span>
            <span className="border-r h-4 border-gray-300 dark:border-gray-500 h-4"></span>
            <span className="text-ls text-gray-500 dark:text-gray-400">{statusItem.count}</span>
          </button>
        ))}
      </div>
    </>
  );
}
