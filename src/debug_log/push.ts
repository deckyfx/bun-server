class DebugLog {
  private readonly id: string;
  private readonly timestamp: Date;
  private readonly tag: string;
  private readonly data: string;

  constructor(payload: string) {
    const data = JSON.parse(payload) as {
      id: string;
      timestamp: number;
      tag: string;
      data: string;
      rxdb_synced: boolean;
    };
    this.id = data.id;
    this.timestamp = new Date(data.timestamp);
    this.tag = data.tag;
    this.data = data.data;
  }

  log() {
    console.log(
      `[${this.formatDateTime(this.timestamp)}] [${this.tag}] ${this.data}`
    );
  }

  private formatDateTime(date: Date): string {
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false, // Use 24-hour format initially to easily get padded hours
    });

    const parts = formatter.formatToParts(date);

    let year = "";
    let month = "";
    let day = "";
    let hour = "";
    let minute = "";
    let second = "";

    for (const part of parts) {
      switch (part.type) {
        case "year":
          year = part.value;
          break;
        case "month":
          month = part.value;
          break;
        case "day":
          day = part.value;
          break;
        case "hour":
          // Manually handle 12-hour format if needed, but using 24-hour with hour12: false
          // and then adjusting is simpler for the 'hh' (01-12) format.
          // If you need 'hh' (01-12) with AM/PM handled separately or just the 01-12 value,
          // you'd need more logic here. For "YYYY-MM-dd hh:mm:ss" which implies 24-hour or
          // potentially 12-hour without AM/PM, sticking to 24-hour and potentially adjusting
          // the hour value is more direct. Let's assume 'hh' here means padded 24-hour for simplicity based on the common usage with YYYY-MM-dd.
          // If 'hh' specifically means 12-hour (01-12), additional logic to convert 00 to 12 and
          // hours > 12 would be needed, along with determining AM/PM if required by the *actual*
          // desired format (which "YYYY-MM-dd hh:mm:ss" doesn't explicitly show AM/PM).
          // Given the format "YYYY-MM-dd hh:mm:ss", 'hh' most likely implies padded hour for either
          // 24-hour or 12-hour without AM/PM indicator. Using hour12: false gives us 00-23,
          // which is a good base. If 01-12 is strictly required without AM/PM, further
          // adjustment is needed. Let's assume 'hh' is padded hour, and hour12: false provides
          // the easiest path to padded hours. If 12-hour (1-12) is needed, you'd get values
          // like '01', '12', '13', etc., from hour12: true and need to handle '00' and > 12.
          // Let's assume 'hh' in "YYYY-MM-dd hh:mm:ss" implies 24-hour padded format (00-23).
          hour = part.value;
          break;
        case "minute":
          minute = part.value;
          break;
        case "second":
          second = part.value;
          break;
      }
    }

    // Manually assemble the string in the desired format
    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}

export default async (req: Bun.BunRequest<"/debug_log">) => {
  const changeRows = (await req.json()) as unknown as {
    newDocumentState?: string;
    assumedMasterState?: string;
  }[];
  const conflicts: string[] = [];
  for (const changeRow of changeRows) {
    if (changeRow.assumedMasterState) {
      // we have a conflict
      new DebugLog(changeRow.assumedMasterState).log();
    } else if (changeRow.newDocumentState) {
      // no conflict -> write the document
      new DebugLog(changeRow.newDocumentState).log();
    }
  }

  return Response.json(conflicts);
};
