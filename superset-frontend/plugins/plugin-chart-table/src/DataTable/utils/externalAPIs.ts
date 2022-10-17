import { SetDataMaskHook } from '@superset-ui/core';

export const updateExternalFormData = (
  setDataMask: SetDataMaskHook = () => {},
  pageNumber: number,
  pageSize: number,
) =>
  setDataMask({
    ownState: {
      currentPage: pageNumber,
      pageSize,
    },
  });
