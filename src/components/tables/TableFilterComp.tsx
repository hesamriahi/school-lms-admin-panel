import {ChevronDownIcon, SweepCleaningIcon} from "../../icons";
import {FileIcon} from "../../icons";
import {SearchIcon} from "../../icons";
import PersianDateTimePicker from "../form/DatePicker/PersianDateTimePicker";
import PersianDateTimeRangePicker from "../form/DatePicker/PersianDateTimeRangePicker";
import Checkbox from "../form/input/Checkbox";
import Input from "../form/input/InputField";
import Radio from "../form/input/Radio";
import Label from "../form/Label";
import MultiSelect from "../form/MultiSelect";
import Select from "../form/Select";
import Switch from "../form/switch/Switch";
import React, { useState } from "react";

export interface FilterItemCustomComponentProps {
  filter: Record<string, any>;
  setFilter: (name: string, value: any) => void;
  filterItem: FilterItemType;
}

export interface FilterItemType {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime' | 'datetimeRange' | 'selectBox' | 'multiSelectBox' | 'checkbox' | 'radio' | 'rangeNumber' | 'toggleSwitch' | 'customComponent';
  options?: { name?: string, label: string, value?: string | number | boolean, selected?: boolean }[];
  columnSize?: 1 | 2 | 3 | 4 | 5 | 6;
  defaultValue?: string | number | boolean;
  /** برای type='customComponent': کامپوننت دلخواه که فیلتر را رندر می‌کند و با setFilter مقدار را به‌روز می‌کند */
  customComponent?: React.ComponentType<FilterItemCustomComponentProps>;
}

interface TableFilterCompProps {
  filterItems: FilterItemType[];
  filter: Record<string, any>;
  setFilter: (name: string, value: any) => void;
  removeFromFilter: (name: string) => void;
  clearAllFilters: () => void;
  reloadTableData: () => void;
  getExcelExport?: () => void;
  // pageTitle: string;
  needExcelExport?: boolean
}

const getColumnSpanClass = (columnSize?: number) => {
  switch (columnSize) {
    case 1:
      return 'xl:col-span-1';
    case 2:
      return 'xl:col-span-2';
    case 3:
      return 'xl:col-span-3';
    case 4:
      return 'xl:col-span-4';
    case 5:
      return 'xl:col-span-5';
    case 6:
      return 'xl:col-span-6';
    default:
      return 'xl:col-span-1';
  }
};


export default function TableFilterComp({
                                          filterItems,
                                          setFilter,
                                          removeFromFilter,
                                          filter,
                                          clearAllFilters,
                                          reloadTableData,
                                          // pageTitle = 'لیست',
                                          needExcelExport = false,
                                          getExcelExport
                                        }: TableFilterCompProps) {

  const clearFiltersAndReload = () => {
    clearAllFilters();
    reloadTableData();
  }

  const [isOpen, setIsOpen] = useState(true);


  return (
    <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] mb-4">
      <div className="px-8 py-2 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800">
        <h3 className="flex items-center gap-2 text-base font-light text-gray-800 dark:text-white/90 cursor-pointer"  onClick={() => setIsOpen(!isOpen)}>
          فیلتر
          <ChevronDownIcon
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          />
        </h3>

        <div
          className={`
            flex gap-2 justify-center items-center ml-3 transition-all duration-300
            ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
          `}
        >
          <button
            className="p-2 bg-gray-400 hover:bg-blue-300 rounded-md flex items-center justify-center"
            title="جستجو"
            onClick={reloadTableData}>
            <SearchIcon className="w-4 h-4 text-black"/>
          </button>

          <button
            className="p-2 bg-red-400 hover:bg-blue-300 rounded-md flex items-center justify-center"
            title="پاکسازی فیلترها"
            onClick={clearFiltersAndReload}>
            <SweepCleaningIcon className="w-4 h-4 text-black dark:text-white"/>
          </button>

          {needExcelExport && (
            <button
              className="p-2 bg-yellow-300 hover:bg-blue-300 rounded-md flex items-center justify-center"
              title="دانلود اکسل"
              onClick={getExcelExport}>
              <FileIcon className="w-4 h-4 text-black"/>
            </button>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div
        className={`w-full transition-all duration-300 ${
          isOpen
            ? 'max-h-screen opacity-100 overflow-visible'
            : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="w-full border-gray-100 p-4 sm:px-6 sm:py-4 dark:border-gray-800">
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-x-4 gap-y-2 xl:grid-cols-6 items-center">
              {filterItems.map((filterItem) => (
                <React.Fragment key={filterItem.name}>
                  {(() => {
                    switch (filterItem.type) {
                      case 'selectBox':
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            {/* <Label>{filterItem.label}</Label> */}
                            <Select
                              options={filterItem.options?.map((option) => ({
                                value: option.value?.toString() || '',
                                label: option.label
                              })) || []}
                              placeholder={filterItem.label}
                              onChange={(value) => setFilter(filterItem.name, value)}
                              className="dark:bg-dark-900"
                            />
                          </div>
                        );

                      case 'multiSelectBox':
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <MultiSelect
                              options={filterItem.options?.map((option) => ({
                                value: option.value?.toString() || '',
                                text: option.label,
                              })) || []}
                              onChange={(values) => setFilter(filterItem.name, values)}
                            />
                            <p className="sr-only">Selected
                              Values: {filterItem.options?.filter((option) => option.selected).map((option) => option.label).join(', ')}</p>
                          </div>
                        );

                      case 'checkbox':
                        const handleCheckBoxOnChange = (filterName: string, optionName: string, value: boolean) => {
                          // If the checkbox is checked (value is true)
                          if (value === true) {
                            if (filterName in filter) {
                              // If the filter already exists, get the list of options
                              const listOfOptions = filter[filterName];
                              if (!listOfOptions.includes(optionName)) {
                                // Add the option to the list if it's not already there
                                listOfOptions.push(optionName);
                                setFilter(filterName, listOfOptions);  // Update the filter with the new list
                              }
                            } else {
                              // If the filter doesn't exist, create a new list with the option
                              setFilter(filterName, [optionName]);  // Set the filter with the new list containing the option
                            }
                          } else {
                            // If the checkbox is unchecked (value is false)
                            if (filterName in filter) {
                              // If the filter exists, get the list of options
                              const listOfOptions = filter[filterName];
                              // Remove the option from the list
                              listOfOptions.splice(listOfOptions.indexOf(optionName), 1);
                              if (listOfOptions.length === 0) {
                                // If the list is empty, remove the filter
                                removeFromFilter(filterName);
                              } else {
                                // If the list is not empty, update the filter with the modified list
                                setFilter(filterName, listOfOptions);
                              }
                            }
                          }

                          // Update the 'selected' state for the option. to change the checkbox state in the UI
                          filterItem.options?.forEach((option) => {
                            if (option.name === optionName) {
                              option.selected = value;  // Set the selected state to the checkbox value (true or false)
                            }
                          });
                        };

                        return (
                          <div
                            className={`flex flex-col sm:flex-row gap-2 sm:gap-4 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <Label className="whitespace-nowrap">{filterItem.label}</Label>
                            <div className="flex flex-wrap gap-3">
                              {filterItem.options?.map((option, index) => (
                                <Checkbox key={index} checked={option.selected ? true : false}
                                          onChange={(checked) => handleCheckBoxOnChange(filterItem.name, option?.name || '', checked)}
                                          label={option.label}/>
                              ))}
                            </div>
                          </div>
                        );

                      case 'radio':
                        const handleRadioOnChange = (filterName: string, optionLabel: string, value: string | number | boolean) => {
                          setFilter(filterName, value);
                          filterItem.options?.forEach((option) => {
                            if (option.label === optionLabel) {
                              option.selected = true;
                            } else {
                              option.selected = false;
                            }
                          });
                        }

                        return (
                          <div
                            className={`flex flex-row items-center gap-4 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <Label className="whitespace-nowrap">{filterItem.label}</Label>
                            <div className="flex flex-wrap gap-3">
                              {filterItem.options?.map((option, index) => (
                                <Radio
                                  key={index}
                                  id={`${filterItem.name}-${index}`}
                                  name={filterItem.name}
                                  value={option.value?.toString() || ''}
                                  checked={option.selected ? true : false}
                                  onChange={(value) => handleRadioOnChange(filterItem.name, option.label, value)} // todo: add onChange function
                                  label={option.label}
                                />
                              ))}
                            </div>
                          </div>
                        );

                      case 'rangeNumber':
                        return (
                          <div className={`flex flex-row gap-4 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <Label>{filterItem.label}</Label>
                            <input type="range" id={filterItem.name} placeholder={filterItem.label}
                                   onChange={(e) => setFilter(filterItem.name, e.target.value)}/>
                          </div>
                        );

                      case 'text':
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            {/* <Label htmlFor="inputTwo">{filterItem.label}</Label> */}
                            <Input type="text" key={filterItem.name} id={filterItem.name} placeholder={filterItem.label}
                                   onChange={(e) => setFilter(filterItem.name, e.target.value)}/>
                          </div>
                        );

                      case 'number':
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            {/* <Label>{filterItem.label}</Label> */}
                            <Input type="number" key={filterItem.name} id={filterItem.name}
                                   placeholder={filterItem.label}
                                   onChange={(e) => setFilter(filterItem.name, e.target.value)}/>
                          </div>
                        );

                      case 'date':
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            {/* <Label>{filterItem.label}</Label> */}
                            {/* todo: add persian date picker */}
                            {/* todo: add onChange function */}
                            <Input type="date" id={filterItem.name} placeholder={filterItem.label}
                                   onChange={(e) => setFilter(filterItem.name, e.target.value)}/>
                          </div>
                        );

                      case 'datetime':
                        // todo: add onChange function
                        // todo: add persian date picker
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <PersianDateTimePicker
                              id={filterItem.name}
                              // label={filterItem.label}
                              placeholder={filterItem.label}
                              onChange={(currentDateString) => {
                                setFilter(filterItem.name, currentDateString);
                              }}
                            />
                          </div>
                        );
                      case 'datetimeRange':
                        // todo: add onChange function
                        // todo: add persian date picker
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <PersianDateTimeRangePicker
                              id={filterItem.name}
                              // label={filterItem.label}
                              placeholder={filterItem.label}
                              onChange={(value) => {
                                setFilter('start_' + filterItem.name, value?.start);
                                setFilter('end_' + filterItem.name, value?.end);
                              }}
                            />
                          </div>
                        );

                      case 'toggleSwitch':
                        return (
                          <div
                            className={`flex flex-row gap-4 items-center ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <Label>{filterItem.label}</Label>
                            <Switch label="" defaultChecked={filterItem.defaultValue === 1}
                                    onChange={(checked) => setFilter(filterItem.name, checked ? 1 : 0)}/>
                          </div>
                        );

                      case 'customComponent':
                        const CustomFilter = filterItem.customComponent;
                        if (!CustomFilter) return null;
                        return (
                          <div className={`col-span-1 ${getColumnSpanClass(filterItem.columnSize)}`}>
                            <CustomFilter
                              filter={filter}
                              setFilter={setFilter}
                              filterItem={filterItem}
                            />
                          </div>
                        );

                      default:
                        return null;
                    }
                  })()}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}