using System.Collections.Generic;

namespace TimeCard.Models
{
    public class CheckInUser
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string NoteCheckIn { get; set; }
    }

    public class Menu
    {
        public string Module { get; set; }
        public string ModuleType { get; set; }
        public string ModuleCode { get; set; }
        public string ModuleName { get; set; }
        public string ModuleIcon { get; set; }
        public string ModuleAction { get; set; }
        public string Params { get; set; }
        public string ModuleGroup { get; set; }
        public string ModuleGroupIcon { get; set; }
        public string ModuleGroupName { get; set; }
        public int ModuleGroupNo { get; set; }
        public int IsHidden { get; set; }
    }

    public class GroupMenu
    {
        public string ModuleGroup { get; set; }
        public string ModuleGroupIcon { get; set; }
        public string ModuleGroupName { get; set; }
        public int ModuleGroupNo { get; set; }
        public List<Menu> Items { get; set; }
    }
}