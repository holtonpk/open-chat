"use client";

import styles from "./background.module.css";

export function Background() {
  return (
    <div className="">
      <div className={styles.main}>
        <div className={styles.content} />
      </div>
    </div>

    // <div className="fixed w-screen">
    //   <div className="relative z-[2] flex flex-col h-[100vh] items-center  justify-center bg-white transition-bg">
    //     <div className="absolute inset-0 overflow-hidden">
    //       <div className="jumbo absolute -inset-[10px] opacity-50"></div>
    //     </div>
    //   </div>
    // </div>
  );
}
