"use client";

import {cn} from "@/lib/utils";
import {motion, SpringOptions, useSpring, useTransform} from "framer-motion";
import {useEffect} from "react";

type AnimatedNumber = {
  value: number;
  className?: string;
  springOptions?: SpringOptions;
};

export function AnimatedNumber({
  value,
  className,
  springOptions,
}: AnimatedNumber) {
  const spring = useSpring(value, springOptions);
  const display = useTransform(
    spring,
    (current) =>
      // round to 3 decimal places
      Math.round(current * 1000) / 1000
  );

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span className={cn("tabular-nums", className)}>
      {display}
    </motion.span>
  );
}
