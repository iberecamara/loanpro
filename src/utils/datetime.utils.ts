export class DateTimeUtils {

    public static getDateTime(options?: { fileFormat?: boolean }): { date: string, time: string, datetime: string } {

        const now = new Date();
        let day: string | number = now.getDate();
        if (day < 10) {
            day = `0${day}`;
        }
        let month: string | number = now.getUTCMonth() + 1;
        if (month < 10) {
            month = `0${month}`;
        }
        const date = `${now.getUTCFullYear()}-${month}-${day}`;

        let hours: string | number = now.getUTCHours();
        if (hours < 10) {
            hours = `0${hours}`;
        }
        let minutes: string | number = now.getUTCMinutes();
        if (minutes < 10) {
            minutes = `0${minutes}`;
        }
        let seconds: string | number = now.getUTCSeconds();
        if (seconds < 10) {
            seconds = `0${seconds}`;
        }
        const time = `${hours}:${minutes}:${seconds}`;

        const datetime = `${date}_${options?.fileFormat ? time.replaceAll(':', '-') : time}`;

        return { date, time, datetime };
    }

}