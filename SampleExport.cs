using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;

namespace ConsoleApp1
{
    class Program
    {
        static void Main(string[] args)
        {
            //https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-printToPDF
            var driverOptions = new ChromeOptions();
            driverOptions.AddArgument("headless");
            using (ChromeDriver driver = new ChromeDriver(driverOptions))
            {
                driver.Navigate().GoToUrl("http://localhost:5500/pages.html");
                WebDriverWait wait = new WebDriverWait(driver, TimeSpan.FromSeconds(1));
                wait.Until(webDriver => ((ChromeDriver)webDriver).ExecuteScript("return document.readyState").Equals("complete"));
                
                Dictionary<string, object> printOptions = new Dictionary<string, object>
                {
                    { "paperWidth", 210 / 25.4 },
                    { "paperHeight", 297 / 25.39 },
                    { "scale", 1},
                    { "marginTop", 0 },
                    { "marginRight", 0 },
                    { "marginBottom", 0 },
                    { "marginLeft", 0 }
                };
                bool @equals = driver.ExecuteScript("return document.readyState").Equals("complete");
                Dictionary<string, object> printOutput = driver.ExecuteChromeCommandWithResult("Page.printToPDF", printOptions) as Dictionary<string, object>;
                byte[] pdf = Convert.FromBase64String(printOutput["data"] as string);
                File.WriteAllBytes("magazine.pdf", pdf);
            }
        }
    }
}
