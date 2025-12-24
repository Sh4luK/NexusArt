const reportWebVitals = (onPerfEntry?: (metric: any) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then((wv: any) => {
      if (wv.getCLS) wv.getCLS(onPerfEntry);
      if (wv.getFID) wv.getFID(onPerfEntry);
      if (wv.getFCP) wv.getFCP(onPerfEntry);
      if (wv.getLCP) wv.getLCP(onPerfEntry);
      if (wv.getTTFB) wv.getTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;