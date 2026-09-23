import React from 'react';
import { TreeSelect } from "antd";
import type { DataNode } from '@rc-component/tree-select/lib/interface';
import type { ChangeEventExtra } from '@rc-component/tree-select/lib/interface';

interface TreeSelectMultiValuesProps {
  treeData: any[];
  keyName: string;
  titleName: string;
  childKeyName: string;
  value?: (string | number )[];
  onChange?: (value: (string | number)[], labelList: React.ReactNode[], extra: ChangeEventExtra) => void;
  setValue?: () => void;
  placeholder?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  className?: string;
}

const treeDataPreparator = (
  data: any[],
  keyName: string,
  titleName: string,
  childKeyName: string,
  parentPath: string = ''
): DataNode[] => {
  if (!Array.isArray(data)) {
    return [];
  }
  
  return data.map((item, index) => {
    // ایجاد key یکتا بر اساس مسیر در tree (فرمت پیش‌فرض antd: 0-0, 0-1, 0-0-0, ...)
    const uniqueKey = parentPath ? `${parentPath}-${index}` : `${index}`;
    
    // value از item[keyName] گرفته می‌شود (برای استفاده در onChange و ...)
    const itemValue = item[keyName] != null && item[keyName] !== '' ? item[keyName] : uniqueKey;
    
    const node: DataNode = {
      title: item[titleName],
      key: uniqueKey, // key یکتا برای React (فرمت 0-0, 0-1, ...)
      value: itemValue, // value از item[keyName] برای استفاده در onChange
    };

    // اگر children وجود داشت، به صورت recursive تبدیل کن
    if (item[childKeyName] && Array.isArray(item[childKeyName]) && item[childKeyName].length > 0) {
      node.children = treeDataPreparator(
        item[childKeyName], 
        keyName, 
        titleName, 
        childKeyName,
        uniqueKey // ارسال مسیر فعلی به children
      );
    }
    return node;
  });
};

const TreeSelectMultiValues: React.FC<TreeSelectMultiValuesProps> = ({
  treeData,
  value,
  keyName,
  titleName,
  childKeyName,
  onChange,
  setValue,
  placeholder = 'Please select',
  style,
  disabled = false,
  className,
}) => {
  const tProps = {
    treeData: treeDataPreparator(treeData, keyName, titleName, childKeyName),
    value,
    onChange: onChange || (setValue ? () => setValue() : undefined),
    treeCheckable: true,
    treeCheckStrictly: true, // توانایی انتخاب والد و فرزند به صورت مستقل
    showCheckedStrategy: TreeSelect.SHOW_ALL, // نمایش همه انتخاب‌شده‌ها (والد و فرزند مستقل از یکدیگر)
    placeholder,
    disabled,
    style: {
      width: '100%',
      ...style,
    },
    className,
  };

  return <TreeSelect {...tProps} />;
};

export default TreeSelectMultiValues;

