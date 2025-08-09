// src/hooks/useSelectableList.ts
import { useState, useCallback } from 'react';

/**
 * 通用选择列表 Hook，用于复用列表项的选择逻辑
 * @param initial 初始选中项（默认为空）
 */
export const useSelectableList = <T extends number | string | bigint>(
  initial: T[] = []
) => {
  const [selected, setSelected] = useState<T[]>(initial);

  // 切换单项选择状态
  const toggle = useCallback((item: T) => {
    setSelected((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  }, []);

  // 清空
  const clear = useCallback(() => setSelected([]), []);

  // 全选
  const selectAll = useCallback((items: T[]) => setSelected(items), []);

  return {
    selected,
    setSelected,
    toggle,
    clear,
    selectAll,
  };
};

export default useSelectableList;
