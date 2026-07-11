import dayjs from "dayjs";
import crypto from "crypto";

const generateBatchNumber = () => {
  return `BAT-${dayjs().format("YYYYMMDD")}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;
};

export default generateBatchNumber;
