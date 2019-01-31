namespace AppLensV3.Models
{
    public class Package
    {
        public string CodeString;
        public string DllBytes;
        public string PdbBytes;
        public string Id;
    }

    public class DetectorCommit
    {
        public string Sha;
        public string Author;
        public string DateTime;
        public string PreviousSha;

        public DetectorCommit(string sha, string author, string dateTime, string previousSha)
        {
            Sha = sha;
            Author = author;
            DateTime = dateTime;
            PreviousSha = previousSha;
        }
    }
}
